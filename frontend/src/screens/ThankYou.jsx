/**
 * ThankYou Component
 * 
 * Final screen displayed after photo session completion.
 * Thanks the user and provides options to view photos or return home.
 * 
 * Features:
 * - Thank you message with friendly closing
 * - Decorative elements (hearts, cherry blossom, love letter, teddy bears)
 * - Navigation options: Home or View Photos
 * - SoSo Clicks branding display
 * 
 * @returns {JSX.Element} Thank you screen with navigation options
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FallingSparkles, FloatingBubbles, FallingHearts, ConfettiRain, TwinklingStars } from '../components/Decoration';

function ThankYou() {
  const navigate = useNavigate();

  return (
    // Main container with light pink background
    <div style={{ background: "#f6DDD8", height: "100vh", overflow: "hidden" }} className="flex items-center justify-center p-6">
      <FallingHearts />
      {/* Content panel: Cream background with coral-pink border */}
      <div
        className="relative rounded-3xl text-center max-w-5xl w-full"
        style={{
          height: "90%",
          background: "#f7f4E8", // Cream white background
          border: "5px solid #FF6B6A", // Coral-pink border
          padding: 0,
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        }}
      >
        {/* SoSo Clicks logo at top */}
        <div className=" flex items-center justify-center " style={{ position: 'relative' }}>
          {/* Main camera logo icon */}
          <img
            className=''
            src="/images/logo_camera-.png"
            alt="soso clicks logo"
            style={{ width: 450, height: 180, objectFit: "contain", position: 'absolute', top: 300 }}
          />
          {/* Main thank you message */}
          <h1 style={{ color: '#F08080', fontSize: 60, fontWeight: 800, position: 'absolute', top: 500 }}>
            Thank you!
          </h1>

          {/* Closing message */}
          <p style={{ fontSize: 30, position: 'absolute', top: 600, color: '#6B2D9B' }}>
            Please visit us again soon.
          </p>
          <div className="mt-2 flex justify-center gap-4" style={{ position: 'absolute', top: 750 }}>
            {/* Home button: Returns to welcome screen */}
            <button
              onClick={() => navigate('/')}
              className="px-8 py-5 text-2xl rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-all"
            >
              Home
            </button>

            {/* View Photos button: Goes to share/download screen */}
            <button
              onClick={() => navigate('/share')}
              className="px-8 py-5 text-2xl rounded-lg bg-rose-400 text-white font-bold hover:bg-rose-500 shadow-lg transition-all"
            >
              View Photos
            </button>
          </div>
        </div>



        {/* Action buttons */}

        {/* Decorative love letter (top-left) */}
        <div className="absolute" style={{ top: 20, left: 20 }}>
          <div style={{
            width: 60,
            height: 50,
            background: '#FFB6C1',
            borderRadius: 8,
            border: '2px solid #F08080',
            position: 'relative',
            padding: '20px 40px'
          }}>
            <div >
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#D83A4A',
                fontSize: 20,
                fontWeight: 700
              }}>
                LOVE
              </div>
            </div>
          </div>
        </div>

        {/* Decorative cherry blossom (top-right) */}
        <img
          src="/images/flower.png"
          alt="decorative flower"
          className="absolute"
          style={{ top: 0, right: 0, width: 180, height: 130, objectFit: "contain" }}
        />

        {/* Decorative hearts: Scattered across the panel */}
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
        <img src="/images/heart3-l.png" alt="heart" style={{ position: "absolute", top: 70, left: 100, width: 36 }} />
        <img src="/images/heart1-r.png" alt="heart" style={{ position: "absolute", top: 100, left: 140, width: 28 }} />
        <img src="/images/heart1-r.png" alt="heart" style={{ position: "absolute", top: 200, left: 290, width: 28 }} />
        <img src="/images/pink-heart-r.png" alt="heart" style={{ position: "absolute", top: 50, right: 210, width: 44 }} />
        <img src="/images/heart2.png" alt="heart" style={{ position: "absolute", top: 150, left: 210, width: 44 }} />
        <img src="/images/heart1-r.png" alt="heart" style={{ position: "absolute", top: 140, right: 90, width: 30 }} />
        <img src="/images/heart1-r.png" alt="heart" style={{ position: "absolute", top: 70, left: 320, width: 30 }} />
        <img src="/images/heart3-l.png" alt="heart" style={{ position: "absolute", top: 280, left: 250, width: 26 }} />
        <img src="/images/heart3-l.png" alt="heart" style={{ position: "absolute", top: 240, left: 310, width: 26 }} />
        <img src="/images/pink-heart-l.png" alt="heart" style={{ position: "absolute", top: 280, right: 240, width: 40 }} />
        <img src="/images/light-pink-l.png" alt="heart" style={{ position: "absolute", top: 230, right: 300, width: 35 }} />
        <img src="/images/light-pink-l.png" alt="heart" style={{ position: "absolute", top: 110, right: 200, width: 25 }} />
        <img src="/images/light-pink.png" alt="heart" style={{ position: "absolute", top: 140, right: 210, width: 60 }} />
        <img src="/images/light-pink.png" alt="heart" style={{ position: "absolute", top: 70, right: 100, width: 50 }} />


        {/* Decorative teddy bears at bottom */}
        {/* Left bear: Waving */}
        <img
          src="/images/teddy_left.png"
          alt="teddy bear waving"
          className="absolute"
          style={{ bottom: 0, left: 0, width: 200, height: 'auto' }}
        />

        {/* Right bear: With heart on chest */}
        <img
          src="/images/teddy_right.png"
          alt="teddy bear with heart"
          className="absolute"
          style={{ bottom: 0, right: 0, width: 250, height: 'auto' }}
        />
      </div>
    </div>
  );
}

export default ThankYou;
