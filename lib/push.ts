interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: PushSubscriptionKeys;
}

interface PushPayload {
  title: string;
  message: string;
  actionUrl?: string;
  icon?: string;
}

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushPayload
): Promise<void> {
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT ?? "mailto:admin@modelconnect.africa";

  if (!vapidPublic || !vapidPrivate) {
    console.log("[push] VAPID keys not set — mock push:", payload.title);
    return;
  }

  try {
    const webpush = await import("web-push");
    webpush.default.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

    await webpush.default.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify({
        title: payload.title,
        body: payload.message,
        icon: payload.icon ?? "/icons/icon-192x192.png",
        badge: "/icons/badge-72x72.png",
        data: { url: payload.actionUrl ?? "/" },
      })
    );
  } catch (error) {
    console.error("[push] Failed to send:", error);
    throw error;
  }
}
