import { SHELL_DESCRIPTION, SHELL_TITLE } from "@/src/experience/shell-copy";
import { AgentReadinessBadge } from "@/src/experience/AgentReadinessBadge";
import { CartGatePanel } from "@/src/review/CartGatePanel";
import { DemoModeBanner } from "@/src/experience/DemoModeBanner";
import { getStoreDomain } from "@/src/commerce/shopify-config";
import { ManualDeskExperience } from "@/src/experience/ManualDeskExperience";

export default function Home() {
  const deterministicCommerce = getStoreDomain() === "mock.shop";
  return (
    <main className="shell">
      <DemoModeBanner active={deterministicCommerce} />
      <section className="shell__hero" aria-labelledby="shell-title">
        <p className="shell__eyebrow">Shopify × WebMCP proof of concept</p>
        <h1 id="shell-title">{SHELL_TITLE}</h1>
        <p className="shell__lede">{SHELL_DESCRIPTION}</p>
        <AgentReadinessBadge />
      </section>

      <section className="shell__preview" aria-label="Upcoming miniature desk world">
        <div className="shell__desk" aria-hidden="true">
          <div className="shell__lamp" />
          <div className="shell__surface" />
          <div className="shell__leg shell__leg--left" />
          <div className="shell__leg shell__leg--right" />
        </div>
        <div className="shell__copy">
          <p>Foundation passed</p>
          <h2>The manual miniature world is live below.</h2>
          <p>
            Commerce remains authoritative while every visible scene edit flows
            through the same versioned domain commands.
          </p>
        </div>
      </section>

      <ManualDeskExperience />
      <CartGatePanel />
    </main>
  );
}
