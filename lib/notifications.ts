import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  actionUrl?: string;
  sendPush?: boolean;
  sendEmail?: boolean;
}

export async function createAndDeliverNotification(payload: NotificationPayload) {
  const { userId, title, message, type, actionUrl, sendPush = false, sendEmail = false } = payload;

  try {
    const notification = await prisma.notification.create({
      data: { userId, title, message, type, actionUrl },
    });

    if (sendPush) {
      try {
        await sendWebPush(userId, { title, message, actionUrl });
        await prisma.notification.update({
          where: { id: notification.id },
          data: { pushSent: true, pushSentAt: new Date() },
        });
      } catch (err) {
        console.warn("[push] Failed to send push notification:", err);
      }
    }

    if (sendEmail) {
      try {
        const { sendEmailNotification } = await import("@/lib/email");
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
        if (user) {
          await sendEmailNotification({
            to: user.email,
            subject: title,
            html: `<p>Hi ${user.name},</p><p>${message}</p>${actionUrl ? `<p><a href="${actionUrl}">View Details</a></p>` : ""}`,
            text: message,
          });
          await prisma.notification.update({
            where: { id: notification.id },
            data: { emailSent: true, emailSentAt: new Date() },
          });
        }
      } catch (err) {
        console.warn("[email] Failed to send email notification:", err);
      }
    }

    return notification;
  } catch (error) {
    console.error("[createAndDeliverNotification]", error);
    throw error;
  }
}

async function sendWebPush(
  userId: string,
  payload: { title: string; message: string; actionUrl?: string }
) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) return;

  const { sendPushNotification } = await import("@/lib/push");

  await Promise.allSettled(
    subscriptions.map((sub) =>
      sendPushNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
    )
  );
}
