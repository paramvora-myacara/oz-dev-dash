export interface ReplyData {
  to: string;
  from: string;
  subject: string;
  originalMessageId: string;
  body: string;
}

export async function sendReply(replyData: ReplyData): Promise<void> {
  const response = await fetch('https://api.sparkpost.com/api/v1/transmissions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SPARKPOST_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipients: [{ address: { email: replyData.to } }],
      content: {
        from: replyData.from,
        subject: replyData.subject,
        text: replyData.body,
        headers: {
          'In-Reply-To': replyData.originalMessageId,
          'References': replyData.originalMessageId,
        },
      },
      options: {
        click_tracking: false,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send reply: ${error}`);
  }
}
