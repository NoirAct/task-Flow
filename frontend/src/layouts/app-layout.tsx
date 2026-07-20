import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
