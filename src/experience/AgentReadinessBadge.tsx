"use client";

import { useEffect, useState } from "react";
import { getModelContext, type WebMcpCapability } from "@/src/webmcp/capability";
import { auditToolNames } from "@/src/webmcp/tool-audit";

const LABELS: Record<WebMcpCapability, string> = {
  checking: "Checking browser-agent support",
  supported: "Agent-ready · Shopify runtime detected",
  unsupported: "Agent tools unavailable · manual shell remains",
  error: "Agent tool audit failed · manual shell remains",
};

export function AgentReadinessBadge() {
  const [capability, setCapability] = useState<WebMcpCapability>("checking");

  useEffect(() => {
    const modelContext = getModelContext();
    if (!modelContext) {
      const timeout = window.setTimeout(() => setCapability("unsupported"), 0);
      return () => window.clearTimeout(timeout);
    }

    let active = true;

    auditToolNames(modelContext)
      .then((audit) => {
        if (!active) return;
        window.__deskbuilderToolAudit = audit;
        if (process.env.NODE_ENV === "development") {
          console.info("[deskbuilder] WebMCP tool audit", audit);
        }
        setCapability("supported");
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error("[deskbuilder] WebMCP registration failed", error);
        setCapability("error");
      });

    return () => {
      active = false;
      delete window.__deskbuilderToolAudit;
    };
  }, []);

  return (
    <div className="shell__status" data-state={capability} role="status">
      <span aria-hidden="true" />
      {LABELS[capability]}
    </div>
  );
}
