/**
 * Shared Framer Motion variants + viewport presets for scroll-triggered animations.
 * Inspired by Ofisense/Linear-style "each section comes alive on scroll".
 *
 * Use with:
 *   <motion.section
 *     variants={revealStagger}
 *     initial="hidden"
 *     whileInView="show"
 *     viewport={SCROLL_VIEWPORT}
 *   />
 */

export const SCROLL_VIEWPORT = { once: true, margin: '-12% 0px -12% 0px', amount: 0.15 };
export const SCROLL_VIEWPORT_REPEAT = { once: false, margin: '-8% 0px', amount: 0.25 };

const EASE = [0.22, 1, 0.36, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 60, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: EASE },
  },
};

export const fadeUpSmall = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92, y: 40 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.75, ease: EASE },
  },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

/** Container that staggers its children when revealed. */
export const revealStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.11, delayChildren: 0.08 },
  },
};

/** Stronger stagger for grids of cards. */
export const revealStaggerStrong = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.14, delayChildren: 0.1 },
  },
};

/** Child variant paired with revealStagger — subtle fade+rise. */
export const staggerChild = {
  hidden: { opacity: 0, y: 34, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: EASE },
  },
};

/** Heavier child variant for hero cards. */
export const staggerChildBig = {
  hidden: { opacity: 0, y: 60, scale: 0.9, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.85, ease: EASE },
  },
};
