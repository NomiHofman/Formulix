import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/* =========================================================
   TypeWriter Effect
   
   Character-by-character typing animation - makes AI
   responses feel like they're being generated in real-time!
   ========================================================= */

export default function TypeWriter({ 
  text, 
  speed = 50, 
  onComplete,
  className = '',
  cursorColor = '#00e5ff',
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;
    
    setDisplayedText('');
    setIsComplete(false);
    let currentIndex = 0;

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeNextChar, speed);
      } else {
        setIsComplete(true);
        onComplete?.();
      }
    };

    setTimeout(typeNextChar, 100);
  }, [text, speed, onComplete]);

  return (
    <span className={className} style={{ direction: 'ltr', display: 'inline' }}>
      {displayedText}
      {!isComplete && (
        <motion.span
          style={{
            display: 'inline-block',
            width: '2px',
            height: '1em',
            backgroundColor: cursorColor,
            marginLeft: '2px',
            verticalAlign: 'text-bottom',
            boxShadow: `0 0 8px ${cursorColor}`,
          }}
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </span>
  );
}

/* =========================================================
   GlitchText Effect
   
   Cyberpunk-style text glitch animation
   ========================================================= */
export function GlitchText({ text, className = '' }) {
  return (
    <motion.span
      className={className}
      style={{ position: 'relative', display: 'inline-block' }}
      whileHover="glitch"
    >
      <span style={{ position: 'relative', zIndex: 1 }}>{text}</span>
      <motion.span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          color: '#ff007a',
          clipPath: 'inset(0 0 50% 0)',
          opacity: 0,
        }}
        variants={{
          glitch: {
            opacity: [0, 0.8, 0],
            x: [-2, 2, -2],
            transition: { duration: 0.2, repeat: 3 },
          },
        }}
      >
        {text}
      </motion.span>
      <motion.span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          color: '#00e5ff',
          clipPath: 'inset(50% 0 0 0)',
          opacity: 0,
        }}
        variants={{
          glitch: {
            opacity: [0, 0.8, 0],
            x: [2, -2, 2],
            transition: { duration: 0.2, repeat: 3, delay: 0.1 },
          },
        }}
      >
        {text}
      </motion.span>
    </motion.span>
  );
}

/* =========================================================
   ScrambleText Effect
   
   Random characters that resolve into the final text
   ========================================================= */
export function ScrambleText({ text, duration = 1500, className = '' }) {
  const [displayText, setDisplayText] = useState('');
  const chars = 'אבגדהוזחטיכלמנסעפצקרשת!@#$%^&*()0123456789';

  useEffect(() => {
    if (!text) return;

    const iterations = Math.ceil(duration / 50);
    let currentIteration = 0;

    const scramble = () => {
      if (currentIteration >= iterations) {
        setDisplayText(text);
        return;
      }

      const progress = currentIteration / iterations;
      const revealedLength = Math.floor(text.length * progress);
      
      let result = text.slice(0, revealedLength);
      for (let i = revealedLength; i < text.length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      
      setDisplayText(result);
      currentIteration++;
      setTimeout(scramble, 50);
    };

    scramble();
  }, [text, duration]);

  return <span className={className}>{displayText}</span>;
}
