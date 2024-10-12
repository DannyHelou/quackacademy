import React from 'react';
import './PixelButton.css';  // CSS file for styling

const PixelButton = ({ label, onClick }) => {
  return (
    <button className="pixel-button" onClick={onClick}>
      {label}
    </button>
  );
};

export default PixelButton;