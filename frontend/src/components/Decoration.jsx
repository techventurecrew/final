import React from 'react';

// 1. FALLING SPARKLES - Glittery dots falling
export const FallingSparkles = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {[...Array(25)].map((_, i) => (
            <div
                key={i}
                style={{
                    position: 'absolute',
                    left: `${Math.random() * 100}%`,
                    top: '-20px',
                    width: `${4 + Math.random() * 8}px`,
                    height: `${4 + Math.random() * 8}px`,
                    background: ['#FF6B6A', '#FFB5B5', '#FFD700', '#FFF'][i % 4],
                    borderRadius: '50%',
                    boxShadow: '0 0 6px currentColor',
                    animation: `fallSparkle ${4 + Math.random() * 6}s linear infinite`,
                    animationDelay: `${Math.random() * 4}s`,
                }}
            />
        ))}
        <style>{`
      @keyframes fallSparkle {
        0% { transform: translateY(0) translateX(0) scale(0); opacity: 0; }
        10% { transform: scale(1); opacity: 1; }
        50% { transform: translateY(50vh) translateX(20px); }
        100% { transform: translateY(100vh) translateX(-20px) scale(0.5); opacity: 0; }
      }
    `}</style>
    </div>
);

// 2. FALLING HEARTS - Heart emojis falling
export const FallingHearts = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {[...Array(15)].map((_, i) => (
            <div
                key={i}
                style={{
                    position: 'absolute',
                    left: `${5 + (i * 6.5)}%`,
                    top: '-30px',
                    fontSize: `${12 + Math.random() * 14}px`,
                    opacity: 0.3 + Math.random() * 0.4,
                    animation: `fallHeart ${5 + Math.random() * 5}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                }}
            >
                {['❤️', '💕', '💗', '🩷'][i % 4]}
            </div>
        ))}
        <style>{`
      @keyframes fallHeart {
        0% { transform: translateY(0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.6; }
        90% { opacity: 0.6; }
        100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
      }
    `}</style>
    </div>
);

// 3. CONFETTI RAIN - Colorful confetti
export const ConfettiRain = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {[...Array(20)].map((_, i) => (
            <div
                key={i}
                style={{
                    position: 'absolute',
                    left: `${Math.random() * 100}%`,
                    top: '-20px',
                    width: `${8 + Math.random() * 6}px`,
                    height: `${8 + Math.random() * 6}px`,
                    background: ['#FF6B6A', '#FFB347', '#FF9ECD', '#87CEEB', '#98FB98'][i % 5],
                    borderRadius: i % 3 === 0 ? '50%' : '2px',
                    animation: `fallConfetti ${3 + Math.random() * 4}s linear infinite`,
                    animationDelay: `${Math.random() * 3}s`,
                }}
            />
        ))}
        <style>{`
      @keyframes fallConfetti {
        0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0; }
        10% { opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity: 0.3; }
      }
    `}</style>
    </div>
);

// 4. FLOATING BUBBLES - Rising bubbles
export const FloatingBubbles = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {[...Array(12)].map((_, i) => (
            <div
                key={i}
                style={{
                    position: 'absolute',
                    left: `${8 + i * 8}%`,
                    bottom: '-40px',
                    width: `${15 + Math.random() * 25}px`,
                    height: `${15 + Math.random() * 25}px`,
                    border: `2px solid rgba(255, 107, 106, ${0.2 + Math.random() * 0.3})`,
                    borderRadius: '50%',
                    background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), transparent)`,
                    animation: `riseBubble ${6 + Math.random() * 4}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                }}
            />
        ))}
        <style>{`
      @keyframes riseBubble {
        0% { transform: translateY(0) scale(0.5); opacity: 0; }
        20% { opacity: 0.7; transform: scale(1); }
        80% { opacity: 0.5; }
        100% { transform: translateY(-100vh) scale(0.8); opacity: 0; }
      }
    `}</style>
    </div>
);

// 5. TWINKLING STARS - Fixed twinkling stars
export const TwinklingStars = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {[...Array(20)].map((_, i) => (
            <div
                key={i}
                style={{
                    position: 'absolute',
                    left: `${5 + Math.random() * 90}%`,
                    top: `${5 + Math.random() * 90}%`,
                    fontSize: `${10 + Math.random() * 12}px`,
                    animation: `twinkle ${1 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: 0.4,
                }}
            >
                {['✨', '⭐', '🌟', '💫'][i % 4]}
            </div>
        ))}
        <style>{`
      @keyframes twinkle {
        0%, 100% { opacity: 0.2; transform: scale(0.8); }
        50% { opacity: 0.8; transform: scale(1.2); }
      }
    `}</style>
    </div>
);