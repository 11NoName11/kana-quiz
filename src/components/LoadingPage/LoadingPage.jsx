import React, { useEffect, useState } from 'react';
import './LoadingPage.scss';
import MHImage from '../../assets/img/MH (1).png';

const LoadingPage = ({ onLoadingComplete }) => {
  useEffect(() => {
    // Show loading page for 3 seconds then call the callback
    const timer = setTimeout(() => {
      onLoadingComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <div className="loading-page">
      <img src={MHImage} alt="MH" className="loading-image" />
      <div className="wrapper">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="shadow"></div>
        <div className="shadow"></div>
        <div className="shadow"></div>
      </div>
    </div>
  );
};

export default LoadingPage;
