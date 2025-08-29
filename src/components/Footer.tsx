import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      <div className="container mx-auto">
        <p>&copy; {currentYear} TechOblivion. All rights reserved.</p>
        <p>
          <a href="https://techoblivion.in" className="text-blue-400 hover:underline">
            Visit TechOblivion
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;