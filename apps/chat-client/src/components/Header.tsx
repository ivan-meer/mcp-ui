import React from 'react';

interface HeaderProps {
  // Props will be defined later, e.g., active server name, user info
}

const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <h1 className="text-xl font-bold">Chat Client</h1>
      {/* Placeholder for more dynamic content */}
    </header>
  );
};

export default Header;
