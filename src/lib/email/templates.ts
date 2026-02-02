/**
 * Email templates for automated follow-ups.
 * Uses the exact HTML shell from ozl-backend for visual consistency.
 */

const BASE_SHELL = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  background-color: #f3f4f6;
  margin: 0;
  padding: 16px 0;
  font-size: 15px;
  line-height: 1.6;
">
  <div style="
    width: 100%;
    max-width: 640px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08), 0 8px 20px rgba(15, 23, 42, 0.06);
  ">
    <div style="
      background-color: #1e88e5;
      padding: 18px 20px;
    ">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td width="140" valign="middle">
            <img
              src="https://ozlistings.com/OZListings-Dark.png"
              alt="OZ Listings"
              width="140"
              height="32"
              style="display: block; max-width: 140px; height: auto;"
            >
          </td>
          <td valign="middle" style="padding-left: 12px;">
            <div style="
              margin: 0;
              font-size: 11px;
              letter-spacing: 0.14em;
              text-transform: uppercase;
              color: #bfdbfe;
            ">OZ Listings</div>
            <div style="
              margin: 2px 0 0 0;
              font-size: 18px;
              line-height: 1.4;
              color: #ffffff;
              font-weight: 800;
            ">{{subject}}</div>
          </td>
        </tr>
      </table>
    </div>

    <div style="padding: 20px 20px 18px 20px;">
      {{content}}
    </div>

    <div style="
      border-top: 1px solid #e5e7eb;
      padding: 12px 24px 20px 24px;
      background-color: #f9fafb;
    ">
      <p style="
        margin: 0 0 4px 0;
        font-size: 11px;
        color: #9ca3af;
      ">
        © {{year}} OZ Listings. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

export interface TemplateData {
  prospectName: string;
  propertyName: string;
  callerName: string;
  extras?: {
    webinar?: boolean;
    consultation?: boolean;
  };
}

export function getTemplate(outcome: string, data: TemplateData): { subject: string; html: string } {
  let subject = '';
  let content = '';

  const firstName = data.prospectName ? data.prospectName.split(' ')[0] : 'Developer';
  const greeting = `<p style="margin: 0 0 16px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">Hi <span style="font-weight:600">${firstName}</span>,</p>`;
  const signature = `<p style="margin: 16px 0 0 0; font-size: 15px; color: #4b5563; line-height: 1.6;">To your success,<br /><strong>${data.callerName}</strong></p>`;

  switch (outcome) {
    case 'pending_signup': {
      subject = `Following Up on Our Conversation - OZ Listings`;

      const promoCode = `FOUNDINGSPONSORJUNE1`;
      const signupUrl = `https://ozlistings.com/developers?utm_promo=${promoCode}`;

      let extrasText = '';
      if (data.extras?.webinar || data.extras?.consultation) {
        const items = [];
        if (data.extras.webinar) items.push('one free webinar showcasing your listing');
        if (data.extras.consultation) items.push('one free consultation');

        const extrasDescription = items.length === 2 ? items.join(' and ') : items[0];
        extrasText = `<p style="font-size:15px;line-height:24px;margin:16px 0 16px 0;color:#111827;"><strong>As we discussed, we will include ${extrasDescription} along with your listing.</strong> We are keeping track of this on our end and will coordinate the details with you once you're set up.</p>`;
      }

      content = `
                    ${greeting}
                    <p style="font-size:15px;line-height:24px;margin:0 0 16px 0;color:#111827;">It was great talking with you today.</p>
                    
                    <p style="font-size:15px;line-height:24px;margin:0 0 16px 0;color:#4b5563;">Onboarding your project onto OZ listings is now easier than ever. And it's completely free till June 1. Cancel anytime with no penalty.</p>
                    
                    <p style="font-size:15px;line-height:24px;margin:0 0 8px 0;color:#111827;font-weight:600;">Your onboarding is as simple as:</p>
                    <ol style="font-size:15px;line-height:24px;margin:0 0 16px 0;padding-left:20px;color:#4b5563;">
                      <li style="margin-bottom:8px;">Pick a pricing plan (we won't be charging for this until June 1).</li>
                      <li style="margin-bottom:8px;">Upload your docs - flyers, OMs, financial models, etc. Our AI will use these to build out a listing website, and keep confidential docs behind a CA in our due diligence vault.</li>
                      <li style="margin-bottom:8px;">Our team will get your listing live in 24-48 hours.</li>
                    </ol>

                    ${extrasText}

                    <p style="font-size:15px;line-height:24px;margin:0 0 16px 0;color:#4b5563;">Click the button below or use the promo code <strong style="color:#1e88e5;">${promoCode}</strong> during checkout to have your subscription completely free until June 1st.</p>

                    <div style="margin: 24px 0; text-align: center;">
                      <a href="${signupUrl}" style="
                        background-color: #1e88e5;
                        color: #ffffff;
                        padding: 14px 32px;
                        border-radius: 8px;
                        text-decoration: none;
                        display: block;
                        width: 100%;
                        box-sizing: border-box;
                        font-weight: 600;
                        font-size: 16px;
                        text-align: center;
                      ">Get Started Now</a>
                    </div>
                    
                    ${signature}
                `;
      break;
    }

    case 'no_answer': {
      subject = 'Tried Reaching You - OZ Listings';
      const promoCode = `FOUNDINGSPONSORJUNE1`;
      const signupUrl = `https://ozlistings.com/developers?utm_promo=${promoCode}`;
      content = `
                ${greeting}
                <p style="font-size:15px;line-height:24px;margin:0 0 16px 0;color:#111827;">I tried to reach you earlier today to talk about your Opportunity Zone project.</p>
                
                <p style="font-size:15px;line-height:24px;margin:0 0 16px 0;color:#4b5563;">We're currently running a special promotion at OZ Listings and I wanted to make sure you didn't miss out. It is now easier than ever to get your project on our platform.</p>
                
                <p style="font-size:15px;line-height:24px;margin:0 0 16px 0;color:#4b5563;">Onboarding takes literally no time-it’s <strong>fully free until June 1st, with no fees (onboarding or otherwise)</strong>. We can have your listing live and in front of the <strong>largest Opportunity Zone investor network</strong> in the country within <strong>24 to 48 hours</strong>.</p>
                
                <p style="font-size:15px;line-height:24px;margin:0 0 16px 0;color:#4b5563;">Feel free to reach out via email or click the button below to get all the info you need to get started.</p>

                <div style="margin: 24px 0; text-align: center;">
                  <a href="${signupUrl}" style="
                    background-color: #1e88e5;
                    color: #ffffff;
                    padding: 14px 32px;
                    border-radius: 8px;
                    text-decoration: none;
                    display: block;
                    width: 100%;
                    box-sizing: border-box;
                    font-weight: 600;
                    font-size: 16px;
                    text-align: center;
                  ">Get Started Now</a>
                </div>
                
                ${signature}
            `;
      break;
    }

    case 'invalid_number': {
      subject = 'Trying to Reach You - OZ Listings';
      const promoCode = `FOUNDINGSPONSORJUNE1`;
      const signupUrl = `https://ozlistings.com/developers?utm_promo=${promoCode}`;
      content = `
                ${greeting}
                <p style="font-size:15px;line-height:24px;margin:0 0 16px 0;color:#111827;">I've been trying to reach you regarding your Opportunity Zone project, but the phone number we have on file doesn't seem to be working.</p>
                <p style="font-size:15px;line-height:24px;margin:0 0 16px 0;color:#4b5563;">I wanted to let you know that OZ Listings is running a special promotion that allows you to list your project on our marketplace <strong>fully free through June 1st, with no fees (onboarding or otherwise).</strong></p>
                
                <p style="font-size:15px;line-height:24px;margin:0 0 16px 0;color:#4b5563;">Onboarding is easier than ever, and we can have your listing live within <strong>24 to 48 hours</strong>. Would you be interested in learning more? Feel free to reply to this email or provide a better number to reach you.</p>

                <div style="margin: 24px 0; text-align: center;">
                  <a href="${signupUrl}" style="
                    background-color: #1e88e5;
                    color: #ffffff;
                    padding: 14px 32px;
                    border-radius: 8px;
                    text-decoration: none;
                    display: block;
                    width: 100%;
                    box-sizing: border-box;
                    font-weight: 600;
                    font-size: 16px;
                    text-align: center;
                  ">Get Started Now</a>
                </div>

                ${signature}
            `;
      break;
    }

    default:
      throw new Error(`No template found for outcome: ${outcome}`);
  }

  const html = BASE_SHELL
    .replace('{{subject}}', subject)
    .replace('{{content}}', content)
    .replace('{{year}}', new Date().getFullYear().toString());

  return { subject, html };
}
