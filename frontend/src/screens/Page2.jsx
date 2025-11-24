import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FallingSparkles, FloatingBubbles, FallingHearts, ConfettiRain, TwinklingStars } from '../components/Decoration';

const Page2 = ({ updateSession }) => {
  const navigate = useNavigate();
  const PRICE = 200;

  const openRazorpay = () => {
    const options = {
      key: "rzp_test_RimfJf1PyS9dtx",
      amount: PRICE * 100,
      currency: "INR",
      name: "Your App",
      description: "UPI QR Payment",
      image: "/images/logo.png",

      handler: function (response) {
        // Payment Success Callback
        if (updateSession) {
          updateSession({
            paymentStatus: "completed",
            amountPaid: PRICE,
            paymentId: response.razorpay_payment_id,
          });
        }
        navigate("/grid");
      },

      theme: { color: "#F48B9A" },

      // Enable UPI + QR payment
      method: { upi: true },
      upi: { type: "qr" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div style={{ background: "#f6DDD8", height: "100vh", overflow: "hidden" }} className="flex items-center justify-center">
      <FallingHearts />
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

        <div className="relative flex flex-col items-center justify-center">
          <p className='absolute top-28'
            style={
              {
                color: "#9E619C",
                fontWeight: "800",
                fontSize: 66,
                padding: "20px 30px"
              }
            }
          >PAY 200 TO START</p>
          <div className=" flex space-x-40 items-center absolute" style={{ top: 340 }}>
            <div className=" flex flex-col items-center space-y-6 cursor-pointer" onClick={() => navigate('/cash-password')}>
              <div className="w-40 h-30 flex items-center justify-center  text-3xl">


                <img src="/images/cash.png" alt="" />
              </div>
              <p className="text-red-500 font-extrabold text-4xl">CASH</p>
            </div>
            <div className="flex flex-col items-center space-y-6 cursor-pointer"
              onClick={openRazorpay}>
              <div className="w-32 h-32 bg-neutral-900 p-2 rounded-md">
                {/* QR Code placeholder */}
                <img src="/images/qr.png" alt="QR Code" />
              </div>
              <p className="text-red-500 font-extrabold text-4xl">ONLINE</p>
            </div>
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
          <img src="/images/light-pink-l.png" alt="heart" style={{ position: "absolute", top: 340, right: 1, width: 50 }} />
          <img src="/images/heart1-r.png" alt="heart" style={{ position: "absolute", top: 340, left: 50, width: 36 }} />
          <img src="/images/heart2.png" alt="heart" style={{ position: "absolute", top: 500, left: 80, width: 28 }} />
          <img src="/images/heart2.png" alt="heart" style={{ position: "absolute", top: 600, left: 210, width: 28 }} />
          <img src="/images/pink-heart-r.png" alt="heart" style={{ position: "absolute", top: 300, right: 130, width: 44 }} />
          <img src="/images/heart3-l.png" alt="heart" style={{ position: "absolute", top: 500, left: 150, width: 44 }} />
          <img src="/images/heart2.png" alt="heart" style={{ position: "absolute", top: 440, right: 60, width: 30 }} />
          <img src="/images/heart2.png" alt="heart" style={{ position: "absolute", top: 340, left: 220, width: 30 }} />
          <img src="/images/heart1-r.png" alt="heart" style={{ position: "absolute", top: 580, left: 150, width: 26 }} />
          <img src="/images/heart1-r.png" alt="heart" style={{ position: "absolute", top: 540, left: 260, width: 26 }} />
          <img src="/images/pink-heart-l.png" alt="heart" style={{ position: "absolute", top: 580, right: 170, width: 40 }} />
          <img src="/images/light-pink.png" alt="heart" style={{ position: "absolute", top: 530, right: 210, width: 35 }} />
          <img src="/images/light-pink.png" alt="heart" style={{ position: "absolute", top: 390, right: 100, width: 25 }} />
          <img src="/images/light-pink-l.png" alt="heart" style={{ position: "absolute", top: 440, right: 270, width: 60 }} />
          <img src="/images/light-pink-l.png" alt="heart" style={{ position: "absolute", top: 340, right: 1, width: 50 }} />
          <img src="/images/light-pink-l.png" alt="heart" style={{ position: "absolute", top: 540, right: 1, width: 50 }} />
          <img src="/images/heart2.png" alt="heart" style={{ position: "absolute", top: 540, left: 50, width: 36 }} />
          <img src="/images/heart3-l.png" alt="heart" style={{ position: "absolute", top: 700, left: 80, width: 28 }} />
          <img src="/images/heart3-l.png" alt="heart" style={{ position: "absolute", top: 800, left: 210, width: 28 }} />
          <img src="/images/pink-heart-l.png" alt="heart" style={{ position: "absolute", top: 500, right: 130, width: 44 }} />
          <img src="/images/heart2.png" alt="heart" style={{ position: "absolute", top: 700, left: 150, width: 44 }} />
          <img src="/images/heart1-r.png" alt="heart" style={{ position: "absolute", top: 640, right: 60, width: 30 }} />
          <img src="/images/heart1-r.png" alt="heart" style={{ position: "absolute", top: 540, left: 220, width: 30 }} />
          <img src="/images/heart3-l.png" alt="heart" style={{ position: "absolute", top: 780, left: 150, width: 26 }} />
          <img src="/images/heart3-l.png" alt="heart" style={{ position: "absolute", top: 740, left: 260, width: 26 }} />
          <img src="/images/pink-heart-l.png" alt="heart" style={{ position: "absolute", top: 780, right: 170, width: 40 }} />
          <img src="/images/light-pink-l.png" alt="heart" style={{ position: "absolute", top: 730, right: 210, width: 35 }} />
          <img src="/images/light-pink-l.png" alt="heart" style={{ position: "absolute", top: 590, right: 100, width: 25 }} />
          <img src="/images/light-pink.png" alt="heart" style={{ position: "absolute", top: 640, right: 270, width: 60 }} />
          <img src="/images/light-pink.png" alt="heart" style={{ position: "absolute", top: 540, right: 1, width: 50 }} />

        </div>
        <div className="absolute bottom-1 left-0">
          <img src="/images/teddy_kiss.png" alt="teddy kiss" style={{ width: 160 }} />
        </div>
        <div className="absolute bottom-1 right-0">
          <img src="/images/teddy_money.png" alt="teddy money" style={{ width: 160, bottom: 0, right: 0 }}

          />
        </div>
      </div>
    </div >
  );
};

export default Page2;
