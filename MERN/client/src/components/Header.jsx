import React, { useState } from 'react';
import Slider from 'react-slick';
import bg6 from '../assets/bg6.jpg';
import bg2 from '../assets/bg2.jpg';
import bg3 from '../assets/bg3.jpg';
import bg4 from '../assets/bg4.jpg';
import bg5 from '../assets/bg5.jpg';
import TryNowButton from './TryNowButton';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const images = [bg6, bg5, bg3, bg2, bg4];

const Header = ({ titles }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    beforeChange: (current, next) => setCurrentTextIndex(next),
  };

  return (
    <div className="relative w-full h-[100vh] overflow-hidden">
      <Slider {...sliderSettings} className="w-full h-full">
        {images.map((img, index) => (
          <div key={index} className="w-full h-full relative">
            <img
              src={img}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
              style={{ opacity: '100%' }}
            />
            <div className="absolute inset-0 bg-black opacity-30"></div>
          </div>
        ))}
      </Slider>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
        <h1
          className={`text-white text-4xl md:text-5xl font-bold mb-4 transition-transform duration-1000 ease-in-out`}
          style={{
            transform: `translateX(${currentTextIndex % 2 === 0 ? '-50%' : '50%'})`,
            position: 'absolute',
            left: '50%',
            top: '50%',
            whiteSpace: 'nowrap',
          }}
        >
          {titles[currentTextIndex]}
        </h1>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <TryNowButton className='text-sm mt-4'/>
      </div>
    </div>
  );
};

export default Header;
