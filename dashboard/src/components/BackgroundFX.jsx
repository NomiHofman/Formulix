/* =========================================================
   BackgroundFX
   Exam requirement: floating glow orbs + subtle cyber-grid
   overlay that sits BEHIND every panel on the page.
   ========================================================= */
export default function BackgroundFX() {
  return (
    <div className="bg-layer" aria-hidden="true">
      <div className="cyber-grid" />
      <div className="orb pink" />
      <div className="orb blue" />
      <div className="orb violet" />
    </div>
  );
}
