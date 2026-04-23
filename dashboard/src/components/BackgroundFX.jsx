/* Heavy aurora + canvas + orbs were removed: they caused top-edge “cyan hairlines”
   (GPU + blurred gradients) and severe scroll jank. A flat layer keeps 60fps. */
export default function BackgroundFX() {
  return <div className="bg-layer bg-layer--static" aria-hidden="true" />;
}
