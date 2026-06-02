interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmailNotification(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "ModelConnect.Africa <notifications@modelconnect.africa>";

  if (!apiKey) {
    console.log("[email] RESEND_API_KEY not set — mock email:", payload.subject, "→", payload.to);
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
  } catch (error) {
    console.error("[email] Failed to send:", error);
    throw error;
  }
}
