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
              alt="OZListings"
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
            ">OZListings</div>
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
        © {{year}} OZListings. All rights reserved.
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
      if (data.extras?.webinar || data.extras?.consultation) {
        subject = `${data.callerName} from OZListings - Next Steps`;
        content = `
                    ${greeting}
                    <p style="font-size:15px;line-height:24px;margin:0 0 12px 0;color:#111827;">Great speaking with you about your project at <strong>${data.propertyName}</strong>!</p>
                    ${data.extras.webinar ? '<p style="font-size:15px;line-height:24px;margin:0 0 12px 0;color:#4b5563;">As discussed, I\'ve registered you for our upcoming webinar on maximizing Opportunity Zone investments. You\'ll receive a calendar invite shortly.</p>' : ''}
                    ${data.extras.consultation ? '<p style="font-size:15px;line-height:24px;margin:0 0 12px 0;color:#4b5563;">I\'ve also scheduled your complimentary consultation. Look out for a calendar invite with the details.</p>' : ''}
                    <p style="font-size:15px;line-height:24px;margin:0 0 12px 0;color:#4b5563;">In the meantime, you can explore our marketplace and see how other developers are presenting their OZ projects at <a href="https://ozlistings.com" style="color:#1e88e5;text-decoration:underline;">ozlistings.com</a>.</p>
                    ${signature}
                `;
      } else {
        subject = 'Following Up on Our Call - OZ Listings';
        content = `
                    ${greeting}
                    <p style="font-size:15px;line-height:24px;margin:0 0 12px 0;color:#111827;">As I mentioned on the call, OZ Listings is currently running a promotional offer that allows you to list your Opportunity Zone projects on our marketplace at no cost through June 1 — cancel anytime.</p>
                    <p style="font-size:15px;line-height:24px;margin:0 0 12px 0;color:#4b5563;">To activate the promotion, the system will ask for standard billing details during setup, but no charges will be made before June 1 while the coupon is active.</p>
                    <p style="font-size:15px;line-height:24px;margin:0 0 12px 0;color:#4b5563;">If you'd like to get started before the promotion expires, let me know and I will send over the link with the coupon code.</p>
                    ${signature}
                `;
      }
      break;
    }

    case 'no_answer': {
      subject = 'Tried Reaching You - OZ Listings';
      content = `
                ${greeting}
                <p style="font-size:15px;line-height:24px;margin:0 0 12px 0;color:#111827;">I tried to call you earlier to talk about OZ Listings.</p>
                <p style="font-size:15px;line-height:24px;margin:0 0 12px 0;color:#4b5563;">OZ Listings is currently running a promotional offer that makes it easier than ever to get on the platform — completely free through June 1.</p>
                <p style="font-size:15px;line-height:24px;margin:0 0 12px 0;color:#4b5563;">We can have you onboarded within 24-48 hours and get your deal in front of the largest Opportunity Zone investor network.</p>
                <p style="font-size:15px;line-height:24px;margin:0 0 12px 0;color:#4b5563;">Let me know if you'd like to learn more.</p>
                ${signature}
            `;
      break;
    }

    case 'invalid_number': {
      subject = 'Trying to Reach You - OZ Listings';
      content = `
                ${greeting}
                <p style="font-size:15px;line-height:24px;margin:0 0 12px 0;color:#111827;">I've been trying to reach you regarding your Opportunity Zone project at <strong>${data.propertyName}</strong>, but the phone number we have on file doesn't seem to be working.</p>
                <p style="font-size:15px;line-height:24px;margin:0 0 12px 0;color:#4b5563;">I wanted to let you know that OZ Listings is running a promotional offer that allows you to list your project on our marketplace at no cost through June 1.</p>
                <p style="font-size:15px;line-height:24px;margin:0 0 12px 0;color:#4b5563;">Would you be interested in learning more? Feel free to reply to this email or provide a better number to reach you.</p>
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
