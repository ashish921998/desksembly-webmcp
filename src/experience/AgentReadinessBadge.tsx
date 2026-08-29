"use client";

import { useEffect, useState } from "react";
import { getModelContext, type WebMcpCapability } from "@/src/webmcp/capability";
import { registerDeskBuilderTools } from "@/src/webmcp/register-tools";
import { MockCommerceGateway } from "@/src/commerce/mock-gateway";
import { worldAnimationController } from "@/src/world/animation/WorldAnimationController";

const registryGateway = new MockCommerceGateway();

const LABELS: Record<WebMcpCapability, string> = {
  checking: "Checking browser-agent support",
  supported: "Agent-ready · Shopify + 5 desk tools",
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

    const controller = new AbortController();
    let active = true;

    registerDeskBuilderTools(modelContext, controller, {
      catalog: registryGateway,
      animation: worldAnimationController,
    })
      .then((audit) => {
        if (!active) return;
        window.__deskbuilderToolAudit = audit;
        if (process.env.NODE_ENV === "development") {
          console.info("[deskbuilder] WebMCP tool audit", audit);
        }
        setCapability("supported");
      })
      .catch((error: unknown) => {
        if (
          !active ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }
        console.error("[deskbuilder] WebMCP registration failed", error);
        setCapability("error");
      });

    return () => {
      active = false;
      controller.abort();
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
