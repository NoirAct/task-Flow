import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/services/api";
import { appApi, type AppNotification } from "@/services/app";
import { useAuth } from "@/contexts/auth-context";

type NotificationsContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refresh: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [live, setLive] = useState<AppNotification[]>([]);

  const { data, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: appApi.notifications,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    let socket: Socket | null = null;
    const token = getAccessToken();
    if (!token) return;

    socket = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("notification", (payload: AppNotification) => {
      setLive((current) => [payload, ...current]);
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    });

    return () => {
      socket?.disconnect();
    };
  }, [isAuthenticated, queryClient]);

  const notifications = useMemo(() => {
    const server = data?.notifications ?? [];
    const merged = [...live, ...server];
    const seen = new Set<string>();
    return merged.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [data, live]);

  const value: NotificationsContextValue = {
    notifications,
    unreadCount: notifications.filter((item) => !item.readAt).length,
    markRead: async (id) => {
      await appApi.markNotificationRead(id);
      setLive((current) =>
        current.map((item) =>
          item.id === id ? { ...item, readAt: new Date().toISOString() } : item,
        ),
      );
      await refetch();
    },
    markAllRead: async () => {
      await appApi.markAllNotificationsRead();
      setLive((current) =>
        current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })),
      );
      await refetch();
    },
    refresh: () => {
      void refetch();
    },
  };

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
