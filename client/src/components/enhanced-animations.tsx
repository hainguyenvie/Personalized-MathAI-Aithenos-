import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

// Particle system for celebrations
export function CelebrationParticles({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)]
      }));
      setParticles(newParticles);
      
      setTimeout(() => setParticles([]), 3000);
    }
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-3 h-3 rounded-full"
            style={{ backgroundColor: particle.color }}
            initial={{ 
              x: particle.x, 
              y: particle.y, 
              opacity: 1, 
              scale: 0 
            }}
            animate={{ 
              y: particle.y - 200,
              opacity: 0,
              scale: 1,
              rotate: 360
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 3,
              ease: "easeOut"
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Floating XP animation
export function FloatingXP({ amount, onComplete }: { amount: number; onComplete: () => void }) {
  return (
    <motion.div
      className="fixed z-40 pointer-events-none text-green-600 font-bold text-lg"
      initial={{ 
        y: window.innerHeight / 2,
        x: window.innerWidth / 2,
        opacity: 1,
        scale: 0.5
      }}
      animate={{ 
        y: window.innerHeight / 2 - 100,
        opacity: 0,
        scale: 1.2
      }}
      transition={{ 
        duration: 2,
        ease: "easeOut"
      }}
      onAnimationComplete={onComplete}
    >
      +{amount} XP
    </motion.div>
  );
}

// Progress bar with smooth animations
export function AnimatedProgressBar({ 
  value, 
  className = "",
  showValue = true,
  color = "bg-blue-600"
}: { 
  value: number; 
  className?: string;
  showValue?: boolean;
  color?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full relative`}
          initial={{ width: "0%" }}
          animate={{ width: `${displayValue}%` }}
          transition={{ 
            duration: 1.5,
            ease: "easeInOut"
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
      {showValue && (
        <motion.div 
          className="absolute right-0 -top-6 text-sm font-semibold text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(displayValue)}%
        </motion.div>
      )}
    </div>
  );
}

// Pulsing attention grabber
export function PulseAttention({ children, isActive }: { children: React.ReactNode; isActive: boolean }) {
  return (
    <motion.div
      animate={isActive ? {
        scale: [1, 1.05, 1],
        boxShadow: [
          "0 0 0 0 rgba(59, 130, 246, 0)",
          "0 0 0 10px rgba(59, 130, 246, 0.3)",
          "0 0 0 0 rgba(59, 130, 246, 0)"
        ]
      } : {}}
      transition={{
        duration: 2,
        repeat: isActive ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}

// Card flip animation
export function FlipCard({ 
  front, 
  back, 
  flipped 
}: { 
  front: React.ReactNode; 
  back: React.ReactNode; 
  flipped: boolean;
}) {
  return (
    <div className="relative w-full h-full [perspective:1000px]">
      <motion.div
        className="absolute inset-0 w-full h-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Front */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
          {front}
        </div>
        
        {/* Back */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {back}
        </div>
      </motion.div>
    </div>
  );
}

// Bouncing loader
export function BouncingDots() {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-blue-600 rounded-full"
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

// Typewriter effect
export function TypewriterText({ 
  text, 
  speed = 50,
  className = ""
}: { 
  text: string; 
  speed?: number;
  className?: string;
}) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block"
      >
        |
      </motion.span>
    </span>
  );
}

// Staggered list animation
export function StaggeredList({ 
  children, 
  staggerDelay = 0.1 
}: { 
  children: React.ReactNode[]; 
  staggerDelay?: number;
}) {
  return (
    <div>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            delay: index * staggerDelay,
            duration: 0.5,
            ease: "easeOut"
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

// Morphing shape loader
export function MorphingLoader({ size = 40 }: { size?: number }) {
  return (
    <motion.div
      className="bg-gradient-to-r from-blue-500 to-purple-600 rounded"
      style={{ width: size, height: size }}
      animate={{
        borderRadius: ["20%", "50%", "20%"],
        rotate: [0, 180, 360],
        scale: [1, 1.2, 1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
}

// Success checkmark animation
export function AnimatedCheckmark({ size = 60, color = "#10B981" }: { size?: number; color?: string }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      <motion.path
        d="M9 12l2 2 4-4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ 
          duration: 0.5, 
          delay: 0.3, 
          ease: "easeInOut" 
        }}
      />
    </motion.svg>
  );
}
