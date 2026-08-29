"use client";

import { AnimatePresence, motion } from "motion/react";
import { useWorldAnimation } from "@/src/world/animation/use-world-animation";

export function ActivityRibbon() {
  const animation = useWorldAnimation();
  return (
    <div className="activity-ribbon" aria-label="Visible agent activity" aria-live="polite">
      <span className="activity-ribbon__label">Activity</span>
      <AnimatePresence initial={false}>
        {animation.receipts.slice(-4).map((receipt) => (
          <motion.span
            key={receipt.id}
            className="activity-ribbon__receipt"
            data-status={receipt.status}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {receipt.label} · {receipt.status}
          </motion.span>
        ))}
      </AnimatePresence>
      {!animation.receipts.length ? (
        <span className="activity-ribbon__empty">No scene operation running</span>
      ) : null}
    </div>
  );
}
