/**
 * Email templates for automated follow-ups.
 * Uses the exact HTML shell from ozl-backend for visual consistency.
 */

const BASE_SHELL = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <body style="background-color:#f3f4f6;margin:0">
    <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
      <tbody>
        <tr>
          <td style='font-family:"Avenir", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;background-color:#f3f4f6;margin:0;padding:16px 0;font-size:15px;line-height:1.6'>
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;width:100%;margin:0 auto;background-color:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;box-shadow:0 18px 45px rgba(15, 23, 42, 0.08), 0 8px 20px rgba(15, 23, 42, 0.06)">
              <tbody>
                <tr style="width:100%">
                  <td>
                    <div style="background-color:#1e88e5;padding:18px 20px;display:flex;align-items:center;gap:12px">
                      <img src="https://ozlistings.com/oz-listings-horizontal2-logo-white.webp" alt="OZListings" width="140" height="32" style="display:block;max-width:140px;height:auto" />
                    </div>
                    <div style="padding:20px 20px 18px 20px">
                      {{content}}
                    </div>
                    <div style="border-top:1px solid #e5e7eb;padding:12px 24px 20px 24px;background-color:#f9fafb">
                      <p style="font-size:11px;line-height:24px;margin:0 0 4px 0;color:#9ca3af;margin-top:0;margin-right:0;margin-bottom:4px;margin-left:0">
                        © {{year}} OZListings. All rights reserved.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
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

    const greeting = `<p style="font-size:15px;line-height:24px;margin:0 0 12px 0;color:#111827;">Hi <span style="font-weight:600">${data.prospectName}</span>,</p>`;
    const signature = `<p style="font-size:15px;line-height:24px;margin:12px 0 0 0;color:#4b5563;">To your success,<br /><strong>${data.callerName}</strong></p>`;

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
        .replace('{{content}}', content)
        .replace('{{year}}', new Date().getFullYear().toString());

    return { subject, html };
}
