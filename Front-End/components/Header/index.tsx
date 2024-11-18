import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b-2 border-gray-300 flex items-center justify-between px-4 py-2">
      <nav>
        <div className="flex items-center">
          <a href="/">
          <div className="flex items-center">
              <p className="text-green-200 hover:text-green-800 ml-4">Home</p>
            </div>
          </a>
          <a href="/search" className="text-green-200 hover:text-green-800 ml-4">Search Doctors</a>
        </div>
      </nav>
    </header>
  );
};

export default Header;
