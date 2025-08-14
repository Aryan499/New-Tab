"use client";
import { useState, useEffect } from "react";
import Quotes from "../Quotes/Quotes";

export const TimeDisplay = () => {
  const getCurrentTime = () =>
    new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).toUpperCase();

  const [currentTime, setCurrentTime] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(getCurrentTime());
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <>
    {mounted ?
    <>
    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-center anton mt-10 sm:mt-15 md:mt-20 mb-5 sm:mb-8 md:mb-10">
       {currentTime}
    </h1>
    <Quotes/>
    </>
    : ""}
    </>

  );
};

export default TimeDisplay;
// Rajajikighori