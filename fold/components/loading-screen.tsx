"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Rocket, Coffee, Code } from "lucide-react";

const funnyMessages = [
  "🎭 Gathering cultural vibes from IIIT Surat...",
  "🎨 Painting the Spring Fiesta magic...",
  "🎪 Setting up the virtual stage...",
  "☕ Brewing some awesome content (free tier coffee is slow)...",
  "🚀 Launching into the stratosphere... slowly...",
  "🎵 Tuning the instruments for SF 2026...",
  "🎉 Confetti cannons loading at dial-up speed...",
  "🌸 Spring is coming... very... very slowly...",
  "🎭 Our hamsters are running as fast as they can...",
  "💾 Reading data from ancient floppy disks...",
  "🎪 Training circus performers (they're learning fast!)...",
  "🎨 Bob Ross is painting happy little databases...",
  "🔮 Consulting the Oracle... it says 'be patient'...",
  "🎸 Tuning guitars for the cultural fest...",
  "🎬 Director yelled 'Action!' but the camera is still loading...",
  "🌟 Sprinkling some stardust (it's heavier than it looks)...",
  "🎭 Rehearsing the grand opening... almost ready!",
  "🍕 Ordering pizza for our servers (free tier = no delivery)...",
  "🎯 Aiming for perfection... slowly but surely!",
  "🎪 The show must go on... after this loading screen!",
];

const LoadingIcon = () => {
  const [currentIcon, setCurrentIcon] = useState(0);
  const icons = [
    <Sparkles key="sparkles" className="w-16 h-16" />,
    <Zap key="zap" className="w-16 h-16" />,
    <Rocket key="rocket" className="w-16 h-16" />,
    <Coffee key="coffee" className="w-16 h-16" />,
    <Code key="code" className="w-16 h-16" />,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIcon}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ duration: 0.5 }}
        className="text-purple-500"
      >
        {icons[currentIcon]}
      </motion.div>
    </AnimatePresence>
  );
};

export default function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [dots, setDots] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Rotate messages every 3 seconds
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % funnyMessages.length);
    }, 3000);

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    // Fake progress bar that fills slowly
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev; // Stop at 95% until real loading completes
        return prev + Math.random() * 5;
      });
    }, 800);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center z-50">
      <div className="max-w-md w-full px-8 text-center space-y-8">
        {/* Animated Icon */}
        <div className="flex justify-center">
          <LoadingIcon />
        </div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            IIIT Surat SF 2026
          </h1>
          <p className="text-zinc-400 text-sm">Spring Fiesta Loading...</p>
        </motion.div>

        {/* Funny Messages */}
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-zinc-300 text-lg min-h-[60px] flex items-center justify-center"
          >
            {funnyMessages[messageIndex]}
            {dots}
          </motion.p>
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-zinc-500">
            Free tier magic happening... hang tight! ✨
          </p>
        </div>

        {/* Spinning loader */}
        <div className="flex justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
          />
        </div>

        {/* Pro tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-xs text-zinc-600 italic"
        >
          💡 Pro tip: Free tier means free entertainment during load times!
        </motion.div>
      </div>
    </div>
  );
}
