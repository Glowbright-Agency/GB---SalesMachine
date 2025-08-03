'use client'

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const websites = [
  "www.salesforce.com",
  "www.hubspot.com", 
  "www.slack.com",
  "www.zoom.us",
  "www.microsoft.com",
  "www.linkedin.com",
  "www.stripe.com"
];

export function TypingAnimation({
  className = "",
  onWebsiteChange
}: {
  className?: string;
  onWebsiteChange?: (website: string) => void;
}) {
  const [currentWebsiteIndex, setCurrentWebsiteIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const currentWebsite = websites[currentWebsiteIndex];
    let timeoutId: NodeJS.Timeout;

    if (isTyping) {
      // Typing animation
      if (displayedText.length < currentWebsite.length) {
        timeoutId = setTimeout(() => {
          setDisplayedText(currentWebsite.slice(0, displayedText.length + 1));
        }, 100); // 100ms per character
      } else {
        // Finished typing, wait 3 seconds then start erasing
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    } else {
      // Erasing animation
      if (displayedText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 50); // 50ms per character (faster erasing)
      } else {
        // Finished erasing, move to next website
        setCurrentWebsiteIndex((prev) => (prev + 1) % websites.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayedText, isTyping, currentWebsiteIndex]);

  // Notify parent of website changes
  useEffect(() => {
    if (onWebsiteChange && displayedText === websites[currentWebsiteIndex]) {
      onWebsiteChange(displayedText);
    }
  }, [displayedText, currentWebsiteIndex, onWebsiteChange]);

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="inline-block"
      >
        |
      </motion.span>
    </span>
  );
}

export default TypingAnimation;