"use client";

export default function ErrorBoundary({ reset }: { reset: () => void }) {
  return (
    <main className="shell">
      <section className="shell__hero">
        <p className="shell__eyebrow">Recoverable storefront error</p>
        <h1>The desk paused safely.</h1>
        <p className="shell__lede">
          No cart action is assumed successful. Retry this page or continue with the
          deterministic manual workflow.
        </p>
        <button className="error-retry" onClick={reset}>Retry storefront</button>
      </section>
    </main>
  );
}
