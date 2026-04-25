import { Children, cloneElement, isValidElement } from 'react';

const BASE = 'icon-motion';
const VARIANTS = 6;

function hash(name, index) {
  let h = 5381;
  const s = String(name ?? 'b');
  for (let i = 0; i < s.length; i += 1) h = (h * 33) ^ s.charCodeAt(i);
  return ((h >>> 0) + s.length * 7 + (Number(index) || 0) * 13);
}

function pickVariant(h) {
  return h % VARIANTS;
}

function pickDelay(h) {
  return -((h % 47) * 0.06 + (h % 19) * 0.03).toFixed(2);
}

/**
 * ממזג מחלקת תנועה (אחת מ־6) + animation-delay ייחודי לפי name+index.
 * כל אייקון מתחיל בנקודה אחרת במחזור — אין סנכרון.
 */
export default function BouncyIconWrap({ children, className, name, index = 0, ..._rest }) {
  const h = hash(name, index);
  const v = pickVariant(h);
  const delay = pickDelay(h);
  const motionClass = `${BASE} ${BASE}--${v}`;

  const child = Children.only(children);
  if (!isValidElement(child)) {
    return <span className={className}>{children}</span>;
  }
  const prev = child.props.className;
  const merged = [prev, motionClass].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

  const prevStyle = child.props.style;
  const mergedStyle = { ...prevStyle, animationDelay: `${delay}s` };

  const el = cloneElement(child, { className: merged, style: mergedStyle });
  if (className) {
    return (
      <span className={className} style={{ display: 'inline-flex', alignItems: 'center' }}>
        {el}
      </span>
    );
  }
  return el;
}
