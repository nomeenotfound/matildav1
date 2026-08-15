import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useCollection } from '../context/CollectionContext';

export const GlobalBackground: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const { viewMode } = useCollection();
  
  const { scrollY } = useScroll();
  const homeOpacity = useTransform(scrollY, [100, 650], [1, 0]);

  // Helper to send command to the Screenpal iframe
  const sendPlayerCommand = useCallback((commandObj: Record<string, unknown>) => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(commandObj, '*');
      } catch {
        // Safe catch for cross-origin postMessage
      }
    }
  }, []);

  const triggerPlayAndLoop = useCallback(() => {
    sendPlayerCommand({ type: 'muteVideo' });
    sendPlayerCommand({ type: 'playVideo' });
    sendPlayerCommand({ action: 'play' });
    sendPlayerCommand({ method: 'play' });
  }, [sendPlayerCommand]);

  const restartFromBeginning = useCallback(() => {
    sendPlayerCommand({ type: 'setVideoTimestamp', timestamp: 0 });
    sendPlayerCommand({ type: 'muteVideo' });
    sendPlayerCommand({ type: 'playVideo' });
    lastTimeRef.current = Date.now();
  }, [sendPlayerCommand]);

  // Screenpal postMessage listener to handle video lifecycle (ended, paused, ready)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;

      const data = event.data;
      const eventType = typeof data === 'object' ? data.type : '';

      // Screenpal sends these specific event types
      if (eventType === 'videoPlayerEnded') {
        // Video reached the end -> immediately rewind to 0 and replay
        restartFromBeginning();
      } else if (eventType === 'videoPlayerPause') {
        // Video paused unexpectedly -> command it to resume
        triggerPlayAndLoop();
      } else if (eventType === 'videoPlayerReady') {
        // Player initialized -> mute and play
        triggerPlayAndLoop();
      } else if (eventType === 'videoPlayerTimeUpdate') {
        lastTimeRef.current = Date.now();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [restartFromBeginning, triggerPlayAndLoop]);

  // Heartbeat watchdog: periodically verify playback and prevent any stalls
  useEffect(() => {
    const interval = setInterval(() => {
      triggerPlayAndLoop();

      // If no time updates for more than 12 seconds while page is visible, soft-rewind or refresh
      if (document.visibilityState === 'visible' && Date.now() - lastTimeRef.current > 14000) {
        restartFromBeginning();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [triggerPlayAndLoop, restartFromBeginning]);

  // Resume immediately on user interaction, tab visibility change, or window focus
  useEffect(() => {
    const resumeOnEvent = () => {
      triggerPlayAndLoop();
    };

    window.addEventListener('focus', resumeOnEvent);
    window.addEventListener('click', resumeOnEvent, { passive: true });
    window.addEventListener('touchstart', resumeOnEvent, { passive: true });
    window.addEventListener('scroll', resumeOnEvent, { passive: true });
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        triggerPlayAndLoop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', resumeOnEvent);
      window.removeEventListener('click', resumeOnEvent);
      window.removeEventListener('touchstart', resumeOnEvent);
      window.removeEventListener('scroll', resumeOnEvent);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [triggerPlayAndLoop]);

  useEffect(() => {
    setIsLoaded(false);
    const timer = setTimeout(() => setIsLoaded(true), 400);
    return () => clearTimeout(timer);
  }, [viewMode]);

  return (
    <motion.div 
      style={{ opacity: viewMode === 'brand' ? homeOpacity : 1 }}
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 bg-[var(--bg-primary)] transition-colors duration-700"
    >
      <iframe
        key={iframeKey}
        ref={iframeRef}
        id="js_video_iframe"
        src="https://go.screenpal.com/player/cOj2idnvg46?ff=1&title=0&controls=0&a=1&m=1&bg=transparent&share=0&download=0&embed=1&cl=1"
        title="Ambient Global Loop"
        onLoad={() => {
          setIsLoaded(true);
          triggerPlayAndLoop();
        }}
        onError={() => {
          // Automatic recovery if network or iframe errors
          setIframeKey(k => k + 1);
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] sm:w-[130%] h-[160%] sm:h-[130%] max-w-none max-h-none opacity-80 sm:opacity-85 blur-[12px] sm:blur-[16px] saturate-110 object-cover pointer-events-none select-none"
        style={{ border: 'none' }}
        allow="autoplay *; fullscreen *; picture-in-picture *; encrypted-media *; accelerometer *; gyroscope *"
        allowFullScreen
      />
      
      {/* Light Ambient Overlay & Subtle Film Grain with soft aesthetic gradient */}
      <div className="absolute inset-0 bg-[var(--bg-primary)]/20 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--border-maroon)]/5 via-[var(--bg-primary)]/30 to-[var(--bg-primary)]" />
      <div className="absolute inset-0 film-grain opacity-20" />
      
      {/* Soft Initial Page Reveal Layer */}
      <motion.div
        initial={{ opacity: 1, backdropFilter: 'blur(16px)' }}
        animate={{
          opacity: isLoaded ? 0 : 1,
          backdropFilter: isLoaded ? 'blur(0px)' : 'blur(16px)',
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 bg-[var(--bg-primary)]/50 pointer-events-none z-10"
      />
    </motion.div>
  );
};
