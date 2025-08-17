import React, { useEffect, useState } from "react";
import { IoMenu } from "react-icons/io5";
import { IoMdArrowDropdown } from "react-icons/io";
import { Link, useLocation } from "react-router-dom";
import { PiSignInBold } from "react-icons/pi";
import { FaUserPlus } from "react-icons/fa6";

const BottomHeader = () => {
  const navLinks = [
    { name: "Home", link: "/" },
    { name: "About", link: "/about" },
    { name: "Accessories", link: "/Accessories" },
    { name: "blog", link: "/blog" },
    { name: "Contact", link: "/contact" },
  ];

  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  useEffect(() => {
    setIsCategoryOpen(false);
  }, [location]);

  useEffect(() => {
    fetch("https://dummyjson.com/products/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  return (
    <div>
      <div className="bottom-header">
        <div className="container">
          <div className="nav">
            <div className="category-nav">
              <div
                className="category-btn"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              >
                <IoMenu />
                <p>Browse Category</p>
                <IoMdArrowDropdown />
              </div>
              <div
                className={`category-nav-list ${
                  isCategoryOpen ? "active" : ""
                }`}
              >
                {categories.map((category, index) => {
                  return (
                    <Link key={index} to={`category/${category.slug}`}>
                      {category.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="nav-links">
              {navLinks.map((navLink, index) => {
                return (
                  <li
                    key={index}
                    className={
                      location.pathname === navLink.link ? "active" : ""
                    }
                  >
                    <Link to={navLink.link}>{navLink.name}</Link>
                  </li>
                );
              })}
            </div>
          </div>
          <div className="sign-register">
            <Link to="/">
              <PiSignInBold />
            </Link>
            <Link to="/">
              <FaUserPlus />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomHeader;
