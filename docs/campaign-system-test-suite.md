# Email Campaign System - Comprehensive Test Suite

This document provides a complete testing guide for verifying all features of the email campaign system.

## Prerequisites

Before testing, ensure:
- [ ] Database migrations are applied (`npx supabase db push`)
- [ ] Dev server is running (`npm run dev`)
- [ ] You're logged in as an admin user
- [ ] You have a test CSV file ready (see sample below)

## Test CSV Sample

Create a file `test-recipients.csv` with the following content:

```csv
Email,Name,Company,City
john.doe@example.com,John Doe,Acme Corp,San Francisco
jane.smith@example.com,Jane Smith,BuildCo,Los Angeles
invalid-email,Bad User,NoEmail,Nowhere
john.doe@example.com,John Duplicate,Duplicate,Duplicate
test@example.com,Test User,Test Company,Test City
```

## Phase 1: Database & API Testing

### Test 1.1: Campaign CRUD Operations

**Test Campaign Creation:**
```bash
# Create a campaign
curl -X POST "http://localhost:3000/api/campaigns" \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-admin-session-cookie>" \
  -d '{
    "name": "Test Campaign 1",
    "templateSlug": "outreach-marketing",
    "sections": [
      {"id": "1", "name": "Greeting", "type": "text", "mode": "static", "content": "Hello {{Name}}!"}
    ],
    "subjectLine": {"mode": "static", "content": "Welcome {{Name}}"}
  }'

# Expected: 201 Created with campaign object including UUID id
# Save the campaign ID for subsequent tests
```

**Test Campaign Retrieval:**
```bash
# List all campaigns
curl "http://localhost:3000/api/campaigns" \
  -H "Cookie: <your-admin-session-cookie>"

# Expected: Array with your created campaign

# Get single campaign (replace CAMPAIGN_ID)
curl "http://localhost:3000/api/campaigns/<CAMPAIGN_ID>" \
  -H "Cookie: <your-admin-session-cookie>"

# Expected: Single campaign object
```

**Test Campaign Update:**
```bash
# Update campaign name
curl -X PUT "http://localhost:3000/api/campaigns/<CAMPAIGN_ID>" \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-admin-session-cookie>" \
  -d '{"name": "Updated Campaign Name"}'

# Expected: Updated campaign object with new name
```

**Test Campaign Deletion:**
```bash
# Delete campaign (only works for draft campaigns)
curl -X DELETE "http://localhost:3000/api/campaigns/<CAMPAIGN_ID>" \
  -H "Cookie: <your-admin-session-cookie>"

# Expected: {"success": true}
```

### Test 1.2: Email Generation & Staging

**Test CSV Upload:**
```bash
# Generate staged emails from CSV
curl -X POST "http://localhost:3000/api/campaigns/<CAMPAIGN_ID>/generate" \
  -H "Cookie: <your-admin-session-cookie>" \
  -F "file=@test-recipients.csv"

# Expected: 
# {
#   "success": true,
#   "staged": 3,
#   "errors": ["Row 4: Invalid email format...", "Row 5: Duplicate email..."]
# }
```

**Verify Staged Emails:**
```bash
# List staged emails
curl "http://localhost:3000/api/campaigns/<CAMPAIGN_ID>/emails?status=staged" \
  -H "Cookie: <your-admin-session-cookie>"

# Expected: 
# {
#   "emails": [...],
#   "total": 3,
#   "limit": 50,
#   "offset": 0
# }
```

**Test Email Editing:**
```bash
# Get email ID from previous response, then:
curl -X PUT "http://localhost:3000/api/campaigns/<CAMPAIGN_ID>/emails/<EMAIL_ID>" \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-admin-session-cookie>" \
  -d '{"subject": "Manually Edited Subject"}'

# Expected: Updated email with isEdited: true
```

**Test Email Rejection:**
```bash
# Reject an email
curl -X DELETE "http://localhost:3000/api/campaigns/<CAMPAIGN_ID>/emails/<EMAIL_ID>" \
  -H "Cookie: <your-admin-session-cookie>"

# Expected: {"success": true}

# Verify rejection
curl "http://localhost:3000/api/campaigns/<CAMPAIGN_ID>/emails?status=rejected" \
  -H "Cookie: <your-admin-session-cookie>"

# Expected: The rejected email appears in results
```

### Test 1.3: Campaign Launch

**Test Launch:**
```bash
# Launch campaign (queues all staged emails)
curl -X POST "http://localhost:3000/api/campaigns/<CAMPAIGN_ID>/launch" \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-admin-session-cookie>" \
  -d '{"all": true}'

# Expected:
# {
#   "success": true,
#   "queued": 3,
#   "scheduling": {
#     "timezone": "America/Los_Angeles",
#     "intervalMinutes": 3.5,
#     "startTimeUTC": "...",
#     "estimatedEndTimeUTC": "...",
#     "emailsByDay": {"2024-12-09": 3},
#     "totalDays": 1
#   }
# }
```

**Verify Queued Emails:**
```bash
# Check queued emails
curl "http://localhost:3000/api/campaigns/<CAMPAIGN_ID>/emails?status=queued" \
  -H "Cookie: <your-admin-session-cookie>"

# Expected: Emails with:
# - status: "queued"
# - scheduled_for: ISO timestamp (future date)
# - from_email: jeff@connect-ozlistings.com (or other domain)
# - domain_index: 0-6 (rotating)
```

**Verify Campaign Status:**
```bash
# Check campaign status updated
curl "http://localhost:3000/api/campaigns/<CAMPAIGN_ID>" \
  -H "Cookie: <your-admin-session-cookie>"

# Expected: status: "scheduled"
```

### Test 1.4: Test Send

**Test Email Send:**
```bash
# Send test email
curl -X POST "http://localhost:3000/api/campaigns/<CAMPAIGN_ID>/test-send" \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-admin-session-cookie>" \
  -d '{"testEmail": "your-email@example.com"}'

# Expected: {"success": true, "message": "Test email sent to ..."}
# Or preview object if SPARKPOST_API_KEY not set
```

**Verify Test Email:**
- [ ] Check your inbox for test email
- [ ] Subject should have [TEST] prefix
- [ ] Variables should be replaced with sample data
- [ ] HTML formatting should be correct (if HTML format)

### Test 1.5: Unsubscribe Endpoint

**Generate Unsubscribe Link:**
```bash
# Generate token (use Node.js)
node -e "
const crypto = require('crypto');
const email = 'test@example.com';
const secret = process.env.UNSUBSCRIBE_SECRET || 'your-secret-key-change-in-production';
const token = crypto.createHmac('sha256', secret).update(email.toLowerCase()).digest('hex').substring(0, 16);
console.log('http://localhost:3000/api/unsubscribe?email=' + encodeURIComponent(email) + '&token=' + token);
"
```

**Test Unsubscribe:**
- [ ] Open generated URL in browser
- [ ] Should see "Successfully Unsubscribed" page
- [ ] Test with invalid token - should show error
- [ ] Test with missing parameters - should show error

## Phase 2: Frontend UI Testing

### Test 2.1: Campaign List Page

**Navigate to Campaign List:**
1. Go to `http://localhost:3000/admin/campaigns`
2. Verify page loads without errors
3. Verify campaigns from API tests appear in list

**Test Campaign List Features:**
- [ ] Status badges show correct colors
- [ ] Recipient counts display correctly
- [ ] Created dates display correctly
- [ ] "New Campaign" button works
- [ ] Clicking campaign name navigates to edit page
- [ ] Delete button only shows for draft campaigns
- [ ] Delete button works (with confirmation)

### Test 2.2: Campaign Creation

**Create New Campaign:**
1. Click "New Campaign" button
2. Enter campaign name: "Frontend Test Campaign"
3. Click "Create Campaign"
4. Verify redirect to campaign editor page

**Verify Campaign Created:**
- [ ] Campaign appears in list
- [ ] Status is "draft"
- [ ] Can navigate to edit page

### Test 2.3: Campaign Editor Integration

**Load Existing Campaign:**
1. Navigate to `/admin/campaigns/<CAMPAIGN_ID>`
2. Verify campaign data loads:
   - [ ] Campaign name displays in header
   - [ ] Status displays correctly
   - [ ] Sections load in editor
   - [ ] Subject line loads correctly

**Test Editor Functionality:**
- [ ] Can add new sections
- [ ] Can edit section content
- [ ] Can delete sections
- [ ] Can reorder sections
- [ ] Can change subject line
- [ ] Preview updates in real-time
- [ ] Can switch between templates

**Test Save Functionality:**
1. Make changes to sections/subject line
2. Click "Save" (or trigger save)
3. Verify:
   - [ ] Success message appears
   - [ ] Changes persist after page refresh
   - [ ] Updated timestamp changes

### Test 2.4: CSV Upload & Staging Flow

**Upload CSV:**
1. In campaign editor, click "Upload Recipients"
2. Select `test-recipients.csv`
3. Verify:
   - [ ] Upload progress indicator
   - [ ] Success message with staged count
   - [ ] Error messages for invalid rows
   - [ ] Campaign status changes to "staged"
   - [ ] "View Staged" button appears

**View Staged Emails:**
1. Click "View Staged" button
2. Verify:
   - [ ] List of staged emails displays
   - [ ] Each email shows recipient, subject
   - [ ] Can preview email content
   - [ ] Pagination works (if >50 emails)

**Edit Staged Email:**
1. Click "Edit" on a staged email
2. Modify subject or body
3. Save changes
4. Verify:
   - [ ] Changes saved
   - [ ] Email shows "Edited" badge/indicator
   - [ ] `isEdited` flag is true in API response

**Reject Email:**
1. Click "Reject" on a staged email
2. Confirm rejection
3. Verify:
   - [ ] Email removed from staged list
   - [ ] Email appears in rejected list (if viewing rejected)
   - [ ] Email status is "rejected" in API

### Test 2.5: Launch Campaign Flow

**Launch Campaign:**
1. Ensure campaign has staged emails
2. Click "Launch Campaign" button
3. Verify:
   - [ ] Confirmation modal appears
   - [ ] Shows correct email count
   - [ ] Shows estimated completion time
   - [ ] Shows scheduling details

**Confirm Launch:**
1. Click "Launch" in modal
2. Verify:
   - [ ] Success message appears
   - [ ] Campaign status changes to "scheduled"
   - [ ] Redirects to campaign list (or stays on page)
   - [ ] Launch button disappears
   - [ ] Staged emails now show as "queued" in API

**Verify Scheduling:**
- [ ] Check API response for scheduling details
- [ ] Verify `scheduled_for` times are in future
- [ ] Verify times are within working hours (9am-5pm)
- [ ] Verify domain rotation (domain_index cycles 0-6)
- [ ] Verify `from_email` matches domain config

### Test 2.6: Test Send Integration

**Send Test Email:**
1. Click "Test Send" button
2. Enter test email address
3. Click "Send"
4. Verify:
   - [ ] Success message appears
   - [ ] Modal closes
   - [ ] Test email received in inbox
   - [ ] Subject has [TEST] prefix
   - [ ] Variables replaced correctly
   - [ ] Formatting is correct

**Test Error Handling:**
- [ ] Invalid email format shows error
- [ ] Missing email shows error
- [ ] Network errors handled gracefully

## Phase 3: End-to-End Flow Testing

### Complete Campaign Flow Test

**Step-by-Step E2E Test:**

1. **Create Campaign**
   - [ ] Navigate to `/admin/campaigns`
   - [ ] Click "New Campaign"
   - [ ] Enter name: "E2E Test Campaign"
   - [ ] Create campaign
   - [ ] Verify redirect to editor

2. **Design Email**
   - [ ] Select template (or start blank)
   - [ ] Add sections with content
   - [ ] Add variables like {{Name}}, {{Company}}
   - [ ] Set subject line with variables
   - [ ] Preview email
   - [ ] Save campaign

3. **Upload Recipients**
   - [ ] Click "Upload Recipients"
   - [ ] Upload CSV with 5+ recipients
   - [ ] Verify staging success
   - [ ] Check error messages for invalid rows

4. **Review Staged Emails**
   - [ ] View staged emails list
   - [ ] Preview a few emails
   - [ ] Verify variables replaced correctly
   - [ ] Edit one email manually
   - [ ] Reject one email

5. **Send Test Email**
   - [ ] Click "Test Send"
   - [ ] Enter your email
   - [ ] Verify test email received
   - [ ] Check formatting and content

6. **Launch Campaign**
   - [ ] Click "Launch Campaign"
   - [ ] Review scheduling details
   - [ ] Confirm launch
   - [ ] Verify success message

7. **Verify Launch Results**
   - [ ] Check campaign status is "scheduled"
   - [ ] Check emails in `email_queue` table
   - [ ] Verify `scheduled_for` times
   - [ ] Verify domain rotation
   - [ ] Verify `from_email` set correctly

8. **Test Unsubscribe**
   - [ ] Generate unsubscribe link for a recipient
   - [ ] Click link
   - [ ] Verify unsubscribe page
   - [ ] Check SparkPost suppression list (if API key set)

## Phase 4: Edge Cases & Error Handling

### Test Edge Cases

**Empty Campaign:**
- [ ] Create campaign with no sections
- [ ] Try to generate emails - should handle gracefully
- [ ] Try to launch - should show appropriate error

**Invalid CSV:**
- [ ] Upload CSV without Email column
- [ ] Upload empty CSV
- [ ] Upload CSV with all invalid emails
- [ ] Upload CSV with special characters
- [ ] Verify appropriate error messages

**Concurrent Operations:**
- [ ] Try to launch campaign while editing
- [ ] Try to delete campaign with staged emails
- [ ] Try to edit email after launch

**Large Datasets:**
- [ ] Upload CSV with 100+ recipients
- [ ] Verify pagination works
- [ ] Verify performance is acceptable

**Status Transitions:**
- [ ] Verify draft → staged transition
- [ ] Verify staged → scheduled transition
- [ ] Verify cannot generate for non-draft campaigns
- [ ] Verify cannot launch non-staged campaigns

## Phase 5: Database Verification

### Verify Database State

**Check Campaigns Table:**
```sql
SELECT id, name, status, total_recipients, created_at, updated_at 
FROM campaigns 
ORDER BY created_at DESC;
```

**Check Email Queue:**
```sql
SELECT 
  id, 
  campaign_id, 
  to_email, 
  status, 
  scheduled_for, 
  from_email, 
  domain_index,
  is_edited
FROM email_queue 
WHERE campaign_id = '<CAMPAIGN_ID>'
ORDER BY created_at;
```

**Verify Data Integrity:**
- [ ] Campaign IDs match between tables
- [ ] Staged emails have NULL scheduled_for
- [ ] Queued emails have scheduled_for set
- [ ] Edited emails have is_edited = true
- [ ] Rejected emails have status = 'rejected'

## Verification Checklist Summary

### Backend API ✅
- [ ] Campaign CRUD operations work
- [ ] CSV upload and parsing works
- [ ] Email generation works
- [ ] Email editing works
- [ ] Email rejection works
- [ ] Campaign launch works
- [ ] Scheduling logic works
- [ ] Test send works
- [ ] Unsubscribe endpoint works

### Frontend UI ✅
- [ ] Campaign list displays correctly
- [ ] Campaign creation works
- [ ] Campaign editor loads data
- [ ] Editor save works
- [ ] CSV upload UI works
- [ ] Staged emails list works
- [ ] Email editing UI works
- [ ] Launch modal works
- [ ] Test send modal works

### Integration ✅
- [ ] End-to-end flow works
- [ ] Error handling works
- [ ] Edge cases handled
- [ ] Database integrity maintained

## Troubleshooting

**Common Issues:**

1. **"Unauthorized" errors**: Check admin session cookie
2. **CSV parsing errors**: Verify CSV format (UTF-8, proper headers)
3. **Email generation fails**: Check campaign has sections and subject line
4. **Launch fails**: Ensure campaign has staged emails
5. **Test send fails**: Check SPARKPOST_API_KEY is set (or will show preview)

**Debug Commands:**

```bash
# Check campaign status
curl "http://localhost:3000/api/campaigns/<ID>" -H "Cookie: <cookie>"

# Check staged emails count
curl "http://localhost:3000/api/campaigns/<ID>/emails?status=staged" -H "Cookie: <cookie>"

# Check queued emails
curl "http://localhost:3000/api/campaigns/<ID>/emails?status=queued" -H "Cookie: <cookie>"
```

## Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ No API errors (except expected validation errors)
- ✅ Data persists correctly
- ✅ UI updates reflect API changes
- ✅ Error messages are clear and helpful
- ✅ Performance is acceptable (<2s for most operations)

---

**Test Date:** _______________  
**Tester:** _______________  
**Environment:** Development / Staging / Production  
**Notes:** _______________
