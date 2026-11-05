"use client";
import { AgentPanel } from "@/components/agent-panel";
import {
  EmptyClient,
  Loading,
  PageHeading,
} from "@/components/workspace-common";
import { useWorkspace } from "@/components/workspace";
export function Intelligence({ assistant = false }: { assistant?: boolean }) {
  const { selected, loading } = useWorkspace();
  return (
    <>
      <PageHeading
        eyebrow={assistant ? "AI MARKETING ASSISTANT" : "MARKET INTELLIGENCE"}
        title={
          assistant
            ? "A thinking partner for your next move."
            : "A clearer view of your opportunity."
        }
        description={
          assistant
            ? "Bring a question. Get recommendations grounded in your client’s saved context."
            : "Explore positioning, content gaps and research priorities using your business context."
        }
      />
      {loading ? (
        <Loading />
      ) : !selected ? (
        <EmptyClient />
      ) : (
        <AgentPanel
          key={selected.id}
          agent={assistant ? "strategist" : "research"}
          title={assistant ? "Marketing strategist" : "Market research agent"}
          description={
            assistant
              ? "Connect campaign, lead and content insights into a practical plan."
              : "Separate what the data tells you from what still needs research."
          }
        />
      )}
    </>
  );
}
