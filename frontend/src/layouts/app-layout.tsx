import { useState } from "react";
import { Outlet } from "react-router-dom";
import { CommandPalette } from "@/components/command-palette";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { NotificationsProvider } from "@/contexts/notifications-context";

export function AppLayout() {
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <NotificationsProvider>
      <div className="flex h-screen overflow-hidden bg-canvas">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar onOpenCommand={() => setCommandOpen(true)} />
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </NotificationsProvider>
  );
}
