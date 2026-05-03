import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  showCursor?: boolean;
}

export function TypewriterText({ 
  text, 
  className = '', 
  delay = 0, 
  speed = 80,
  showCursor = true 
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursorState, setShowCursorState] = useState(true);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    // Initial delay before starting
    timeout = setTimeout(() => {
      setIsTyping(true);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!isTyping) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        // Blink cursor after typing is done
        const blinkInterval = setInterval(() => {
          setShowCursorState(prev => !prev);
        }, 530);
        
        // Stop blinking after 3 seconds
        setTimeout(() => {
          clearInterval(blinkInterval);
          setShowCursorState(false);
        }, 3000);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isTyping, text, speed]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {displayText}
      {showCursor && (
        <motion.span
          animate={{ opacity: showCursorState ? 1 : 0 }}
          transition={{ duration: 0.1 }}
          className="inline-block w-[3px] h-[1em] bg-amber-500 ml-1 align-middle"
        />
      )}
    </motion.div>
  );
}
