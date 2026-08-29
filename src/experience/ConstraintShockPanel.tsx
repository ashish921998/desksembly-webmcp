"use client";

import { useState } from "react";
import { DomainError } from "@/src/domain/errors";
import { CONSTRAINT_SHOCK_PROMPT } from "@/src/demo/scenario";
import { runConstraintShock } from "@/src/demo/run-constraint-shock";

export function ConstraintShockPanel() {
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState(
    "Lock a favorite, then apply the late US constraints.",
  );
  const [suggestions, setSuggestions] = useState<string[]>([]);

  async function run() {
    if (running) return;
    setRunning(true);
    setSuggestions([]);
    setStatus("Checking the 90 cm desk, $300 budget, and US availability.");
    try {
      const { proposal, result } = await runConstraintShock();
      setStatus(
        `US constraint applied · preserved ${proposal.preservedItemIds.length} · returned ${proposal.returningItemIds.length} · scene v${result.sceneVersion}`,
      );
    } catch (error) {
      if (error instanceof DomainError && error.code === "LOCKED_ITEM_CONFLICT") {
        setStatus(error.message);
        setSuggestions([
          "Unlock or move the conflicting product to a compact anchor.",
          "Keep the desk at 120 cm and retain the locked layout.",
        ]);
      } else {
        setStatus(
          error instanceof DomainError
            ? error.message
            : "The current US constraints could not produce a safe plan.",
        );
        setSuggestions([
          "Increase the $300 budget.",
          "Remove one optional product role.",
        ]);
      }
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="constraint-shock" aria-labelledby="constraint-shock-title">
      <div>
        <p className="shell__eyebrow">Late constraint shock</p>
        <h3 id="constraint-shock-title">Revise around the human choice</h3>
      </div>
      <blockquote>{CONSTRAINT_SHOCK_PROMPT}</blockquote>
      <button disabled={running} onClick={run}>
        {running ? "Replanning…" : "Apply US constraint shock"}
      </button>
      <p role={suggestions.length ? "alert" : "status"}>{status}</p>
      {suggestions.length ? (
        <ul aria-label="Constraint relaxation suggestions">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>{suggestion}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
