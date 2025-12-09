import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET || 'your-secret-key-change-in-production';
const SPARKPOST_API_KEY = process.env.SPARKPOST_API_KEY;

// Generate HMAC token for email
export function generateUnsubscribeToken(email: string): string {
  return crypto
    .createHmac('sha256', UNSUBSCRIBE_SECRET)
    .update(email.toLowerCase())
    .digest('hex')
    .substring(0, 16);
}

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

    // Add to SparkPost suppression list
    if (SPARKPOST_API_KEY) {
      try {
        await fetch('https://api.sparkpost.com/api/v1/suppression-list', {
          method: 'POST',
          headers: {
            'Authorization': SPARKPOST_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipients: [{
              email: email.toLowerCase(),
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
