import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useCollection } from '../context/CollectionContext';

const LOCAL_VIDEO_URL = '/background-loop.mp4';
const API_VIDEO_URL = '/api/media/background-loop.mp4';
const DRIVE_VIDEO_URL = 'https://drive.google.com/uc?export=download&id=1RF6sQuY5B0KJNOPVvAYcgKN37ZawVqsB';

export const GlobalBackground: React.FC = () => {
  const [videoSrc, setVideoSrc] = useState<string>(LOCAL_VIDEO_URL);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { viewMode } = useCollection();
  
  const { scrollY } = useScroll();
  // Smooth, gradual scroll fade into content without any abrupt cutoffs
  const homeOpacity = useTransform(scrollY, [150, 950], [1, 0]);

  // Load video via Blob URL for instant, reliable local playback
  useEffect(() => {
    let active = true;
    let blobUrl: string | null = null;

    async function loadVideoBlob() {
      try {
        const res = await fetch(LOCAL_VIDEO_URL);
        if (res.ok) {
          const blob = await res.blob();
          if (active && blob.size > 1000) {
            blobUrl = URL.createObjectURL(blob);
            setVideoSrc(blobUrl);
          }
        }
      } catch {
        // Fallback to direct URL if blob fetch fails
      }
    }

    loadVideoBlob();

    return () => {
      active = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, []);

  // Autoplay management and continuous looping
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('muted', 'true');
    video.setAttribute('autoplay', 'true');
    video.setAttribute('loop', 'true');

    const startPlayback = () => {
      if (video) {
        video.muted = true;
        const promise = video.play();
        if (promise !== undefined) {
          promise
            .then(() => {
              if (video.currentTime > 0 || video.readyState >= 3) {
                setIsVideoReady(true);
              }
            })
            .catch(() => {
              // Browser autoplay policy retry
            });
        }
      }
    };

    startPlayback();

    const handleInteraction = () => {
      startPlayback();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        startPlayback();
      }
    };

    window.addEventListener('pointerdown', handleInteraction, { passive: true });
    window.addEventListener('touchstart', handleInteraction, { passive: true });
    window.addEventListener('click', handleInteraction, { passive: true });
    window.addEventListener('scroll', handleInteraction, { passive: true });
    window.addEventListener('mousemove', handleInteraction, { passive: true, once: true });
    window.addEventListener('focus', startPlayback);
    document.addEventListener('visibilitychange', handleVisibility);

    const interval = setInterval(() => {
      if (video.paused || video.ended) {
        if (video.ended) {
          video.currentTime = 0;
        }
        startPlayback();
      } else if (video.currentTime > 0 && !isVideoReady) {
        setIsVideoReady(true);
      }
    }, 1200);

    return () => {
      window.removeEventListener('pointerdown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('focus', startPlayback);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, [videoSrc, isVideoReady]);

  const handleVideoError = () => {
    if (videoSrc === LOCAL_VIDEO_URL) {
      setVideoSrc(API_VIDEO_URL);
    } else if (videoSrc === API_VIDEO_URL) {
      setVideoSrc(DRIVE_VIDEO_URL);
    }
  };

  return (
    <motion.div 
      style={{ opacity: viewMode === 'brand' ? homeOpacity : 1 }}
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 bg-[var(--bg-primary)] transition-colors duration-700"
    >
      {/* Video with smooth opacity fade-in once playback has started */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVideoReady ? 0.95 : 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 w-full h-full"
      >
        <video
          ref={videoRef}
          key={videoSrc}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          onError={handleVideoError}
          onTimeUpdate={(e) => {
            if (e.currentTarget.currentTime > 0.05 && !isVideoReady) {
              setIsVideoReady(true);
            }
          }}
          onPlaying={() => setIsVideoReady(true)}
          onLoadedData={() => {
            videoRef.current?.play().catch(() => {});
          }}
          onCanPlay={() => {
            videoRef.current?.play().catch(() => {});
          }}
          onEnded={(e) => {
            const v = e.currentTarget;
            v.currentTime = 0;
            v.play().catch(() => {});
          }}
          className="absolute inset-0 w-full h-full object-cover scale-125 sm:scale-115 blur-[12px] sm:blur-[18px] saturate-115 pointer-events-none select-none"
        >
          <source src={videoSrc} type="video/mp4" />
          <source src={LOCAL_VIDEO_URL} type="video/mp4" />
          <source src={API_VIDEO_URL} type="video/mp4" />
          <source src={DRIVE_VIDEO_URL} type="video/mp4" />
        </video>
        
        {/* Harmonized Ambient Tints and Delicate Film Grain */}
        <div className="absolute inset-0 bg-[var(--bg-primary)]/20 backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 bg-[var(--border-maroon)]/5 mix-blend-multiply" />
        <div className="absolute inset-0 film-grain opacity-15" />
      </motion.div>
    </motion.div>
  );
};
