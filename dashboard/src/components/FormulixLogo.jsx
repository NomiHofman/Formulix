/**
 * Brand mark for FORMULIX — a stylized Σ (sigma) with three nodes.
 * Reused in the header badge and the loading overlay.
 */
export default function FormulixLogo({ size = 34, idSuffix = '' }) {
  const s = idSuffix;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Formulix"
    >
      <path
        d="M28 7 L12 7 L20 20 L12 33 L28 33"
        stroke={`url(#sigmaGrad${s})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="28" cy="7" r="2.5" fill={`url(#nodeGrad1${s})`} />
      <circle cx="20" cy="20" r="3" fill={`url(#nodeGrad2${s})`} />
      <circle cx="28" cy="33" r="2.5" fill={`url(#nodeGrad3${s})`} />
      <circle cx="12" cy="7" r="1.5" fill="#ff007a" opacity="0.7" />
      <circle cx="12" cy="33" r="1.5" fill="#00e5ff" opacity="0.7" />
      <defs>
        <linearGradient id={`sigmaGrad${s}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff007a" />
          <stop offset="50%" stopColor="#8a2bff" />
          <stop offset="100%" stopColor="#00e5ff" />
        </linearGradient>
        <radialGradient id={`nodeGrad1${s}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#ff007a" />
        </radialGradient>
        <radialGradient id={`nodeGrad2${s}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#8a2bff" />
        </radialGradient>
        <radialGradient id={`nodeGrad3${s}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#00e5ff" />
        </radialGradient>
      </defs>
    </svg>
  );
}
