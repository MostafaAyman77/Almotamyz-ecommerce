import React, { useEffect, useState } from "react";
import { IoMenu } from "react-icons/io5";
import { IoMdArrowDropdown } from "react-icons/io";
import { Link, useLocation } from "react-router-dom";
import { PiSignInBold } from "react-icons/pi";
import { FaUserPlus } from "react-icons/fa6";
import "./Header.css";
import AxiosClient from "../../../../Services/AxiosClient";

const BottomHeader = () => {
  const navLinks = [
    { name: "الرئيسية", link: "/" },
    { name: "المتجر", link: "/" },
    { name: "من نكون", link: "/who-are-we" },
    { name: "تواصل معنا", link: "/contact" },
  ];

  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  useEffect(() => {
    setIsCategoryOpen(false);
  }, [location]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await AxiosClient.get("/categories");

        const categoriesData = response.data.data;

        setCategories(
          categoriesData.map((item) => ({
            id: item._id,
            name: item.name,
            slug: item.slug,
            image: item.image,
          }))
        );
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchCategories();
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
