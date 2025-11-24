import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Delete } from 'lucide-react';
import { FallingSparkles, FloatingBubbles, FallingHearts, ConfettiRain, TwinklingStars } from '../components/Decoration';


function CashPassword({ updateSession }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === '123456') {
      updateSession({ paymentStatus: 'completed', amountPaid: 200 });
      navigate('/grid');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const handleKeypadClick = (value) => {
    setError('');
    if (value === 'backspace') {
      setPassword(prev => prev.slice(0, -1));
    } else {
      setPassword(prev => prev + value);
    }
  };

  const keypadButtons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '0', 'backspace'
  ];

  return (
    <div style={{ background: "#f6DDD8", height: "100vh", overflow: "auto" }} className=" p-6 flex items-center justify-center">
      <div
        style={{

          Height: "100%",
          background: "#f7f4E8", // Cream white background
          border: "5px solid #FF6B6A", // Coral-pink border
          padding: 0,
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          borderRadius: '14px'
        }}
      >

        <div className=" rounded-2xl shadow-xl p-3 max-w-md w-full">
          <h2 className="text-3xl font-bold text-gray-800 ">Enter Cash Password</h2>
          <p className="text-gray-600 mb-6">Ask the attendant for the password</p>

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full p-4 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-center text-2xl tracking-widest"
              readOnly
            />

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-4">
                {error}
              </div>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3 mt-6 mb-6">
              {keypadButtons.map((btn, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleKeypadClick(btn)}
                  className={`p-4 rounded-lg font-semibold text-xl transition-all ${btn === 'backspace'
                    ? 'col-span-2 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2'
                    : 'bg-blue-500 hover:bg-blue-600 text-white active:scale-95'
                    }`}
                  style={{
                    fontFamily: 'sans-serif',
                    background: "#FFB6C1", // Light pink background
                    padding: "8px 20px",
                    borderRadius: 18,
                    boxShadow: "0 8px 20px rgba(246,100,130,0.18)", // Subtle shadow
                    border: "4px solid #FF6B6A", // Coral-pink border
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#D83A4A", // Deep pink text
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    textShadow: "2px 2px 2px 5pxrgba(216, 58, 74, 0.7)"
                  }}
                >
                  {btn === 'backspace' ? (
                    <>
                      <Delete size={24} />
                      <span>Delete</span>
                    </>
                  ) : (
                    btn
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/payment')}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 hover:bg-gray-50 font-semibold transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-lg bg-[#FF6B6A] hover:bg-red-500 text-white font-semibold transition-colors"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CashPassword;