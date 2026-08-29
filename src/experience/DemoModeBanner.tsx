export function DemoModeBanner({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <aside className="demo-mode" aria-label="Commerce mode">
      <strong>Deterministic commerce preview</strong>
      <span>Shopify development-store credentials are not connected.</span>
    </aside>
  );
}
