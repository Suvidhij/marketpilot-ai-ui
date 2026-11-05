import { redirect } from "next/navigation";
import { getUser } from "@/lib/server-api";
import { Workspace } from "@/components/workspace";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");
  return <Workspace user={user}>{children}</Workspace>;
}
