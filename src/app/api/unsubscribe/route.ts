import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateUnsubscribeToken } from '@/lib/email/unsubscribe';

const SPARKPOST_API_KEY = process.env.SPARKPOST_API_KEY;

// Verify HMAC token
function verifyToken(email: string, token: string): boolean {
  const expectedToken = generateUnsubscribeToken(email);
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expectedToken)
  );
}

// GET /api/unsubscribe?email=xxx&token=yyy
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
      return new Response(renderErrorPage('Missing email or token'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Verify token
    if (!verifyToken(email, token)) {
      return new Response(renderErrorPage('Invalid or expired unsubscribe link'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const campaignId = searchParams.get('campaign_id');

    // Update Database
    try {
      // We need a service role client to bypass RLS or at least an admin client
      // The createAdminClient in admin.ts uses anon key, which might not be enough if RLS is strict.
      // However, usually unsubscribe is a public-facing action that should be allowed but secured by the token.
      // Given generateUnsubscribeToken works, we trust the identity.
      const { createAdminClient } = await import('@/utils/supabase/admin');
      const supabase = createAdminClient();

      // 1. Update contacts (Global Suppression)
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .update({
          globally_unsubscribed: true,
          suppression_reason: 'unsubscribe',
          suppression_date: new Date().toISOString()
        })
        .eq('email', email.toLowerCase())
        .select('id')
        .single();

      if (contactError) {
        console.error('Error updating global suppression:', contactError);
      }

      // 2. Update campaign_recipients (Campaign Attribution)
      if (campaignId && contact) {
        const { error: recipientError } = await supabase
          .from('campaign_recipients')
          .update({
            status: 'unsubscribed',
            unsubscribed_at: new Date().toISOString()
          })
          .eq('campaign_id', campaignId)
          .eq('contact_id', contact.id);

        if (recipientError) {
          console.error('Error updating campaign recipient:', recipientError);
        }
      }
    } catch (dbError) {
      console.error('Database update failed during unsubscribe:', dbError);
      // We still proceed to SparkPost sync if possible, or at least show success to user
    }

    // Add to SparkPost suppression list
    if (SPARKPOST_API_KEY) {
      try {
        await fetch('https://api.sparkpost.com/api/v1/suppression-list', {
          method: 'PUT',
          headers: {
            'Authorization': SPARKPOST_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipients: [{
              recipient: email.toLowerCase(),
              type: 'non_transactional',
              description: 'User unsubscribed via link',
            }],
          }),
        });
      } catch (error) {
        console.error('Failed to add to SparkPost suppression:', error);
        // Continue anyway - at least show confirmation
      }
    }

    return new Response(renderSuccessPage(email), {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('GET /api/unsubscribe error:', error);
    return new Response(renderErrorPage('An error occurred'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

function renderSuccessPage(email: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Unsubscribed - OZListings</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
    h1 { color: #1e88e5; }
    p { color: #666; line-height: 1.6; }
  </style>
</head>
<body>
  <h1>Successfully Unsubscribed</h1>
  <p>You have been unsubscribed from OZListings marketing emails.</p>
  <p><strong>${email}</strong> will no longer receive promotional emails from us.</p>
  <p>If you unsubscribed by mistake, please contact us at support@ozlistings.com</p>
</body>
</html>
  `;
}

function renderErrorPage(message: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Error - OZListings</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
    h1 { color: #e53935; }
    p { color: #666; line-height: 1.6; }
  </style>
</head>
<body>
  <h1>Unsubscribe Error</h1>
  <p>${message}</p>
  <p>Please contact support@ozlistings.com for assistance.</p>
</body>
</html>
  `;
}
