import React from 'react';
import ReactDOM from 'react-dom/client';

const Popup: React.FC = () => {
  return <h1>NADI, the good flow</h1>;
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<Popup />);
