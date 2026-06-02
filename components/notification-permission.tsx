"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2, X } from "lucide-react";

type PermState = "idle" | "unsupported" | "prompt" | "granted" | "denied" | "loading" | "error";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw     = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export default function NotificationPermission() {
  const [state, setState] = useState<PermState>("idle");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      setState("unsupported"); return;
    }
    const p = Notification.permission;
    if (p === "granted") setState("granted");
    else if (p === "denied") setState("denied");
    else setState("prompt");
  }, []);

  const handleEnable = async () => {
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setState("denied"); return; }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        // No VAPID key yet — just mark as granted
        setState("granted"); return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const { endpoint, keys } = sub.toJSON() as {
        endpoint: string; keys: { p256dh: string; auth: string };
      };

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint, keys, userAgent: navigator.userAgent }),
      });

      setState("granted");
    } catch (err) {
      console.error("[push permission]", err);
      setState("error");
    }
  };

  if (dismissed || state === "unsupported" || state === "granted" || state === "idle") return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="bg-[#1D1A16] rounded-2xl shadow-2xl p-4 flex items-start gap-3 border border-white/10">
        <div className="shrink-0 rounded-full bg-[#C8A96A]/20 p-2 text-[#C8A96A]">
          {state === "denied" ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        </div>

        <div className="flex-1 space-y-1">
          <p className="text-xs font-bold text-white uppercase tracking-widest">
            {state === "denied"  ? "Notifications Blocked"  :
             state === "error"   ? "Something went wrong"   :
             "Enable Notifications"}
          </p>
          <p className="text-[10px] text-white/60 leading-relaxed">
            {state === "denied"
              ? "Allow notifications in your browser settings to stay updated on castings and applications."
              : state === "error"
              ? "Could not register push notifications. Try again later."
              : "Get instant alerts for new castings, application updates, and more — no email needed."}
          </p>

          {state !== "denied" && state !== "error" && (
            <button onClick={handleEnable} disabled={state === "loading"}
              className="mt-2 rounded-full bg-[#C8A96A] px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#11100E] hover:bg-[#BCA062] transition-colors disabled:opacity-60 flex items-center gap-1.5">
              {state === "loading" && <Loader2 className="h-3 w-3 animate-spin" />}
              {state === "loading" ? "Enabling..." : "Enable Notifications"}
            </button>
          )}
        </div>

        <button onClick={() => setDismissed(true)} className="shrink-0 text-white/40 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
