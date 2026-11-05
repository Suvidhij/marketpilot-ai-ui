import { notFound } from "next/navigation";
import { Clients } from "@/components/clients";
import { Records } from "@/components/records";
import { Reports } from "@/components/reports";
import { Automation } from "@/components/automation";
import { Settings } from "@/components/settings";
import { Intelligence } from "@/components/intelligence";
export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  if (module === "clients") return <Clients />;
  if (["leads", "campaigns", "content"].includes(module))
    return <Records resource={module} />;
  if (module === "reports") return <Reports />;
  if (module === "automation") return <Automation />;
  if (module === "settings") return <Settings />;
  if (module === "research") return <Intelligence />;
  if (module === "assistant") return <Intelligence assistant />;
  notFound();
}
