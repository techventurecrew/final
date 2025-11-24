import React from 'react';

function Header() {
  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-6 px-8 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <span className="text-4xl">📸</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold">PhotoBooth Kiosk</h1>
            <p className="text-primary-100 text-lg">Capture Your Memories</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">Touch to Begin</p>
        </div>
      </div>
    </header>
  );
}

export default Header;
