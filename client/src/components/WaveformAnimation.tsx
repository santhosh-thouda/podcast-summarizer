import React from 'react';
import { motion } from 'framer-motion';

interface WaveformAnimationProps {
  darkMode: boolean;
  isActive: boolean;
}

const WaveformAnimation: React.FC<WaveformAnimationProps> = ({ darkMode, isActive }) => {
  const bars = 20;
  const colors = darkMode 
    ? ['#8a63f2', '#9a7af5', '#aa91f8', '#baa8fb'] 
    : ['#4a80f0', '#5c8df5', '#7ea3f7', '#9fb9f9'];

  return (
    <motion.div 
      className="waveform mt-8 flex items-end justify-center gap-1.5 h-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {[...Array(bars)].map((_, i) => {
        const height = 10 + Math.random() * 60;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const duration = 0.5 + Math.random() * 0.5;
        const delay = i * 0.03;
        
        return (
          <motion.div
            key={i}
            className="bar rounded-sm"
            style={{
              width: '0.5rem',
              height: `${height}px`,
              backgroundColor: color,
            }}
            animate={{
              height: isActive ? [height, height * 0.7, height * 1.4, height] : height,
              opacity: isActive ? [0.7, 1, 0.7] : 1,
            }}
            transition={{
              duration: duration,
              repeat: isActive ? Infinity : 0,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: delay,
            }}
          />
        );
      })}
    </motion.div>
  );
};

export default WaveformAnimation; 