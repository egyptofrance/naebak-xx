"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VisitorCounterSettings {
  min: number;
  max: number;
}

export function VisitorCounter() {
  const [count, setCount] = useState<number>(0);
  const [settings, setSettings] = useState<VisitorCounterSettings>({ min: 150, max: 450 });

  // Fetch settings from API
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/settings/visitor-counter");
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
          // Generate initial count
          setCount(Math.floor(Math.random() * (data.max - data.min + 1)) + data.min);
        }
      } catch (error) {
        console.error("Error fetching visitor counter settings:", error);
        // Use default settings
        setCount(Math.floor(Math.random() * (450 - 150 + 1)) + 150);
      }
    }

    fetchSettings();
  }, []);

  // Update count every 45 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newCount = Math.floor(Math.random() * (settings.max - settings.min + 1)) + settings.min;
      setCount(newCount);
    }, 45000); // 45 seconds

    return () => clearInterval(interval);
  }, [settings]);

  if (count === 0) return null;

  return (
    <Badge 
      variant="secondary" 
      className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-colors flex-shrink-0"
    >
      <Users className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
      <span className="hidden sm:inline text-xs whitespace-nowrap">متصل الآن:</span>
      <span className="font-bold text-xs md:text-sm whitespace-nowrap">{count.toLocaleString('ar-EG')}</span>
    </Badge>
  );
}

