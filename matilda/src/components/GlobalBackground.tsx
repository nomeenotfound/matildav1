import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useCollection } from '../context/CollectionContext';
import bgLoopVideo from '../assets/background-loop.mp4';

export const GlobalBackground: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { viewMode } = useCollection();
  
  const { scrollY } = useScroll();
  const homeOpacity = useTransform(scrollY, [100, 650], [1, 0]);

  // Keep video continuously playing and looped without stopping
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    const playVideo = () => {
      if (video) {
        video.muted = true;
        const promise = video.play();
        if (promise !== undefined) {
          promise.catch(() => {
            // Autoplay policy fallback: user interaction will trigger playback
          });
        }
      }
    };

    // Ensure it plays immediately on mount
    playVideo();

    // Re-trigger play on user interaction, window focus, tab visibility & scroll
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        playVideo();
      }
    };

    window.addEventListener('focus', playVideo);
    window.addEventListener('click', playVideo, { passive: true });
    window.addEventListener('touchstart', playVideo, { passive: true });
    window.addEventListener('scroll', playVideo, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    // Watchdog timer: checks every 2 seconds that the video is running and loops seamlessly
    const interval = setInterval(() => {
      if (video.paused || video.ended) {
        if (video.ended) {
          video.currentTime = 0;
        }
        playVideo();
      }
    }, 2000);

    return () => {
      window.removeEventListener('focus', playVideo);
      window.removeEventListener('click', playVideo);
      window.removeEventListener('touchstart', playVideo);
      window.removeEventListener('scroll', playVideo);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setIsLoaded(false);
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, [viewMode]);

  return (
    <motion.div 
      style={{ opacity: viewMode === 'brand' ? homeOpacity : 1 }}
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 bg-[var(--bg-primary)] transition-colors duration-700"
    >
      <video
        ref={videoRef}
        src={bgLoopVideo}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        onLoadedData={() => setIsLoaded(true)}
        onCanPlay={() => {
          setIsLoaded(true);
          videoRef.current?.play().catch(() => {});
        }}
        onEnded={(e) => {
          const v = e.currentTarget;
          v.currentTime = 0;
          v.play().catch(() => {});
        }}
        onError={() => {
          if (videoRef.current && videoRef.current.currentSrc !== window.location.origin + '/background-loop.mp4') {
            videoRef.current.src = '/background-loop.mp4';
            videoRef.current.load();
            videoRef.current.play().catch(() => {});
          }
        }}
        className="absolute inset-0 w-full h-full object-cover scale-125 sm:scale-115 blur-[12px] sm:blur-[18px] saturate-115 opacity-90 pointer-events-none select-none"
      >
        <source src={bgLoopVideo} type="video/mp4" />
        <source src="/background-loop.mp4" type="video/mp4" />
      </video>
      
      {/* Light Ambient Tint & Subtle Film Grain */}
      <div className="absolute inset-0 bg-[var(--bg-primary)]/25 backdrop-blur-[1px]" />
      <div className="absolute inset-0 bg-[var(--border-maroon)]/5 mix-blend-multiply" />
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
