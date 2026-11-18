"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { markAllNotificationsRead, markNotificationRead } from "@/app/dashboard/notifications/actions";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export function NotificationBell({ notifications }: { notifications: Notification[] }) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-navy-700 hover:bg-navy-50"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-crimson-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl bg-white p-2 shadow-lg ring-1 ring-navy-900/10">
          <div className="flex items-center justify-between px-2 py-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Notifications</p>
            {unreadCount > 0 && (
              <form action={markAllNotificationsRead}>
                <button className="text-xs font-medium text-navy-700 hover:underline">Mark all read</button>
              </form>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-slate-400">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`flex items-start gap-2 rounded-lg px-2 py-2.5 ${n.is_read ? "" : "bg-navy-50/60"}`}>
                  <div className="min-w-0 flex-1">
                    {n.link ? (
                      <Link href={n.link} className="block">
                        <p className="text-sm font-medium text-navy-900">{n.title}</p>
                      </Link>
                    ) : (
                      <p className="text-sm font-medium text-navy-900">{n.title}</p>
                    )}
                    {n.body && <p className="mt-0.5 text-xs text-slate-500">{n.body}</p>}
                    <p className="mt-1 text-[10px] text-slate-400">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  {!n.is_read && (
                    <form action={markNotificationRead.bind(null, n.id)}>
                      <button type="submit" className="rounded-full p-1 text-navy-400 hover:bg-navy-100 hover:text-navy-700" aria-label="Mark as read">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
