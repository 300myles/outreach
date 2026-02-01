import type React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Back from "@/components/Back";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} />
      <main className="flex-1">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <SidebarTrigger />

          <Back />
          <div className="flex-1" />
        </div>
        <div className="p-6 max-w-7xl">{children}</div>
      </main>
    </SidebarProvider>
  );
}
