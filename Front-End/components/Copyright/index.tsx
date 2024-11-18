import React from 'react';

function getCurrentYear(): number {
  return new Date().getFullYear();
}

const App: React.FC = () => {
  return (
    <div>
      <p>© All Rights Reserved 2024-{getCurrentYear()}</p>
    </div>
  );
}

export default App;