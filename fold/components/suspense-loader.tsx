"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "./loading-screen";

interface SuspenseLoaderProps {
  children: React.ReactNode;
  minLoadTime?: number; // minimum time to show loader in ms
}

export default function SuspenseLoader({
  children,
  minLoadTime = 1000,
}: SuspenseLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // Ensure loader shows for minimum time
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minLoadTime);

    return () => clearTimeout(timer);
  }, [minLoadTime]);

  useEffect(() => {
    // Simulate checking if content is ready
    if (minTimeElapsed) {
      setIsLoading(false);
    }
  }, [minTimeElapsed]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
