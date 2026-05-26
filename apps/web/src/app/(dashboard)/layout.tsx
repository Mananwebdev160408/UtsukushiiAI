import { cookies } from "next/headers";
import DashboardClientLayout from "@/components/DashboardClientLayout";
import ClientRedirectToLogin from "@/components/ClientRedirectToLogin";

export default async function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // `cookies()` may be async in some Next versions — await to get the store
  const cookieStore = await cookies();
  const session = cookieStore.get?.("utsukushii-session")?.value;
  if (!session) {
    // Render a client-side redirect so we can preserve the original pathname
    return <ClientRedirectToLogin />;
  }

  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
