"use client";

import { useRef, useState } from "react";
import { DomainError } from "@/src/domain/errors";
import { STARTER_PROMPT } from "@/src/demo/scenario";
import { runDeterministicDemo } from "@/src/demo/run-deterministic-demo";
import { worldAnimationController } from "@/src/world/animation/WorldAnimationController";

export function StarterPrompt() {
  const controller = useRef<AbortController | null>(null);
  const [status, setStatus] = useState("Copy this prompt into a compatible browser agent.");
  const [running, setRunning] = useState(false);

  async function runDemo() {
    const nextController = new AbortController();
    controller.current = nextController;
    setRunning(true);
    setStatus("Deterministic replay: validating and staging visible parcels.");
    try {
      await runDeterministicDemo(nextController.signal);
      setStatus("Deterministic replay complete. No cart change occurred.");
    } catch (error) {
      setStatus(
        error instanceof DomainError && error.code === "OPERATION_CANCELLED"
          ? "Replay cancelled. The prior stable scene was preserved."
          : "Replay stopped with a safe scene error.",
      );
    } finally {
      controller.current = null;
      setRunning(false);
    }
  }

  return (
    <section className="starter-prompt" aria-labelledby="starter-prompt-title">
      <div>
        <p className="shell__eyebrow">Starter request</p>
        <h3 id="starter-prompt-title">Ask the browser agent</h3>
      </div>
      <blockquote>{STARTER_PROMPT}</blockquote>
      <div className="starter-prompt__actions">
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(STARTER_PROMPT);
            setStatus("Prompt copied.");
          }}
        >
          Copy prompt
        </button>
        {running ? (
          <button
            onClick={() => {
              controller.current?.abort();
              worldAnimationController.cancel();
            }}
          >
            Cancel parcel sequence
          </button>
        ) : (
          <button data-primary="true" onClick={runDemo}>
            Run labeled deterministic replay
          </button>
        )}
      </div>
      <p role="status">{status}</p>
    </section>
  );
}
