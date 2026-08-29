import { SHELL_DESCRIPTION, SHELL_TITLE } from "@/src/experience/shell-copy";
import { AgentReadinessBadge } from "@/src/experience/AgentReadinessBadge";

export default function Home() {
  return (
    <main className="shell">
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
          <p>Foundation checkpoint</p>
          <h2>The desk world arrives after the commerce gates pass.</h2>
          <p>
            This first shell proves the deployment and Shopify runtime without
            adding scene assets or custom browser-agent tools early.
          </p>
        </div>
      </section>
    </main>
  );
}
