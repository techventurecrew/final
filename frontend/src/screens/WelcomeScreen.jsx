/**
 * WelcomeScreen Component
 * 
 * This is the initial landing screen for the SoSo Clicks Photobooth App.
 * Displays the brand logo, tagline, and a Start button to begin the photo session.
 * 
 * Features:
 * - Brand identity display with "soso clicks" logo and camera icon
 * - Decorative elements (hearts, flower, teddy bears) for playful aesthetic
 * - Initializes new photo session with unique session ID
 * - Navigates to payment screen when Start button is clicked
 * 
 * @param {Function} updateSession - Callback to update session data in parent component
 * @returns {JSX.Element} Welcome screen UI
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FallingSparkles, FloatingBubbles, FallingHearts, ConfettiRain, TwinklingStars } from '../components/Decoration';

function WelcomeScreen({ updateSession }) {
  const navigate = useNavigate();

  // Initialize a new photo session with unique ID when component mounts
  // This ensures each user session has a unique identifier for photo storage
  useEffect(() => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    updateSession({ sessionId, paymentStatus: 'pending' });
  }, [updateSession]);

  /**
   * Handle Start button click
   * Navigates user to the payment screen to begin the photo session process
   */
  const handleStart = () => {
    navigate('/payment');
  };

  return (
    /* Main container with pink background matching SoSo Clicks theme */
    <div style={{ background: "#f6DDD8", height: "100vh", overflow: "hidden" }} className="flex items-center justify-center">
      {/* Content panel with cream background and coral-pink border */}
      {/* <FallingHearts /> */}
      <div
        className="relative w-full max-w-6xl rounded-3xl"
        style={{
          height: "80%",
          background: "#f7f4E8", // Cream white background
          border: "5px solid #FF6B6A", // Coral-pink border
          padding: 0,
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        }}
      >
        {/* Logo section: Camera icon, brand name, and decorative flower */}
        <div className="relative flex flex-col items-center">
          {/* Main camera logo icon */}


          <img
            className=''
            src="/images/logo_camera-.png"
            alt="soso clicks logo"
            style={{
              width: 550, height: 280, objectFit: "contain", position: 'absolute', top: 140
            }}
          />


          {/* Decorative cherry blossom flower in top-right corner */}
          <img
            src="/images/flower.png"
            alt="decorative flower"
            className="absolute"
            style={{ top: 0, right: 0, width: 200, height: 100, objectFit: "contain" }}
          />

          {/* Brand name in coral-pink color */}
          {/* <div style={{ color: "#F59BA7", fontSize: 64, fontWeight: 700, marginTop: 8, fontFamily: 'Poppins, sans-serif' }}>
            soso clicks
          </div> */}
        </div>

        {/* Main tagline: Encourages users to capture their moments */}
        <div className='absolute top-3 flex left-[18%]'>

          <h2 className="text-center " style={{ color: "#9E619C", fontSize: 60, fontWeight: 800, marginTop: '60%' }}>
            CAPTURE YOUR MOMENT
          </h2>
        </div>


        {/* Scattered decorative hearts for whimsical aesthetic */}
        <img src="/images/heart1-r.png" alt="heart" style={{ position: "absolute", top: 140, left: 50, width: 36 }} />
        <img src="/images/heart2.png" alt="heart" style={{ position: "absolute", top: 200, left: 80, width: 28 }} />
        <img src="/images/heart2.png" alt="heart" style={{ position: "absolute", top: 400, left: 210, width: 28 }} />
        <img src="/images/pink-heart-r.png" alt="heart" style={{ position: "absolute", top: 100, right: 130, width: 44 }} />
        <img src="/images/heart3-l.png" alt="heart" style={{ position: "absolute", top: 300, left: 150, width: 44 }} />
        <img src="/images/heart2.png" alt="heart" style={{ position: "absolute", top: 240, right: 60, width: 30 }} />
        <img src="/images/heart2.png" alt="heart" style={{ position: "absolute", top: 140, left: 220, width: 30 }} />
        <img src="/images/heart1-r.png" alt="heart" style={{ position: "absolute", top: 380, left: 150, width: 26 }} />
        <img src="/images/heart1-r.png" alt="heart" style={{ position: "absolute", top: 340, left: 260, width: 26 }} />
        <img src="/images/pink-heart-l.png" alt="heart" style={{ position: "absolute", top: 380, right: 170, width: 40 }} />
        <img src="/images/light-pink.png" alt="heart" style={{ position: "absolute", top: 330, right: 210, width: 35 }} />
        <img src="/images/light-pink.png" alt="heart" style={{ position: "absolute", top: 190, right: 100, width: 25 }} />
        <img src="/images/light-pink-l.png" alt="heart" style={{ position: "absolute", top: 240, right: 270, width: 60 }} />
        <img src="/images/light-pink-l.png" alt="heart" style={{ position: "absolute", top: 140, right: 1, width: 50 }} />

        {/* Primary action button: Starts the photo session */}
        <div className="flex justify-center absolute bottom-1 left-[35%] " style={{ marginBottom: 70 }}>
          <button
            onClick={handleStart}
            style={{

              fontFamily: 'sans-serif',
              background: "#FFB6C1", // Light pink background
              padding: "18px 80px",
              borderRadius: 18,
              boxShadow: "0 8px 20px rgba(246,100,130,0.18)", // Subtle shadow
              border: "4px solid #FF6B6A", // Coral-pink border
              fontSize: 60,
              fontWeight: 800,
              color: "#D83A4A", // Deep pink text
              cursor: "pointer",
              transition: "all 0.3s ease",
              textShadow: "2px 2px 2px 5pxrgba(216, 58, 74, 0.7)",


            }}
            onMouseEnter={(e) => {
              // Hover effect: Darker pink background with enhanced shadow
              e.target.style.background = "#FF9FBE";
              e.target.style.boxShadow = "0 12px 28px rgba(246,100,130,0.25)";
            }}
            onMouseLeave={(e) => {
              // Reset to original state when not hovering
              e.target.style.background = "#FFB6C1";
              e.target.style.boxShadow = "0 8px 20px rgba(246,100,130,0.18)";
            }}
          >
            Start
          </button>
        </div>

        {/* Decorative teddy bear characters at bottom corners */}
        {/* Left bear: Holding a heart */}
        <img
          src="/images/teddy_left.png"
          alt="teddy left"
          style={{ position: "absolute", bottom: 0, left: 0, width: 160, height: "auto" }}
        />
        {/* Right bear: Waving */}
        <img
          src="/images/teddy_right.png"
          alt="teddy right"
          style={{ position: "absolute", bottom: 0, right: 0, width: 160, height: "auto" }}
        />

        {/* Additional decorative hearts: Generated small hearts for texture and depth */}
        {/* These are non-interactive decorative elements */}
        {/* <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {[{ t: 60, l: 240, s: 22 }, { t: 40, l: 340, s: 18 }, { t: 180, l: 320, s: 20 }, { t: 260, l: 420, s: 24 }, { t: 120, l: 80, s: 16 }].map((p, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: p.t,
                left: p.l,
                width: p.s,
                height: p.s,
                background: i % 2 === 0 ? "#F6B0C0" : "#C79AD6", // Alternating pink and purple
                borderRadius: 8,
                transform: "rotate(25deg)", // Rotated for dynamic feel
                opacity: 0.95,
              }}
            />
          ))}
        </div> */}
      </div>
    </div >
  );
}

export default WelcomeScreen;
