import React from 'react';

import Copyright from '@/components/Copyright';

const Footer: React.FC = () => {
  return (
    <footer className={`bg-green-1000 text-white p-4`}>
      <div className="container mx-auto">
        <Copyright />
      </div>
    </footer>
  );
};
export default Footer;