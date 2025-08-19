//import React, { useRef, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
// import required modules
import { Autoplay, Pagination } from "swiper/modules";
import { Link } from "react-router-dom";
import Hero1 from "../../assets/Images/banner_Hero1.jpg";
import Hero2 from "../../assets/Images/banner_Hero2.jpg";
import Hero3 from "../../assets/Images/banner_Hero3.jpg";

const HeroSlider = () => {
  return (
    <div>
      <div className="hero">
        <div className="container">
          <Swiper
            loop={true}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            pagination={true}
            modules={[Autoplay, Pagination]}
            className="mySwiper"
          >
            <SwiperSlide>
              <div className="content">
                <h4>Introducing the new</h4>
                <h3>
                  Microsoft Xbox <br /> 360 Controller
                </h3>
                <p>Windows Xp/11/10/8 ps5, Tv Box</p>
                <Link to="/" className="btn">
                  Shop Now
                </Link>
              </div>
              <img src={Hero1} alt="Slider Hero one" />
            </SwiperSlide>
            <SwiperSlide>
              <div className="content">
                <h4>Introducing the new</h4>
                <h3>
                  Microsoft Xbox <br /> 360 Controller
                </h3>
                <p>Windows Xp/11/10/8 ps5, Tv Box</p>
                <Link to="/" className="btn">
                  Shop Now
                </Link>
              </div>
              <img src={Hero2} alt="Slider Hero Two" />
            </SwiperSlide>
            <SwiperSlide>
              <div className="content">
                <h4>Introducing the new</h4>
                <h3>
                  Microsoft Xbox <br /> 360 Controller
                </h3>
                <p>Windows Xp/11/10/8 ps5, Tv Box</p>
                <Link to="/" className="btn">
                  Shop Now
                </Link>
              </div>
              <img src={Hero3} alt="Slider Hero Three" />
            </SwiperSlide>
          </Swiper>
        </div>
      </div>

      <Swiper
        pagination={true}
        modules={[Pagination]}
        className="mySwiper"
      ></Swiper>
    </div>
  );
};

export default HeroSlider;
