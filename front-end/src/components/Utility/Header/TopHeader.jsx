import React, { useContext } from "react";
import { Link } from "react-router-dom";
import Logo from "../../../assets/Images/brand1.png";
import { FaRegHeart } from "react-icons/fa";
import { TiShoppingCart } from "react-icons/ti";
import "./Header.css";
import { CartContext } from "../../context/CartContext";
import SearchBox from "./SearchBox";

const TopHeader = () => {
  const { cartItems, favorites } = useContext(CartContext);

  return (
    <div>
      <div className="top-header">
        <div className="container">
          <Link to="/">
            {" "}
            <img src={Logo} alt="Logo" />
          </Link>
          <SearchBox />
          <div className="header-icons">
            <div className="icon">
              <Link to="/favorites">
                <FaRegHeart />
                <span className="count">{favorites.length}</span>
              </Link>
            </div>
            <div className="icon">
              <Link to="/cart">
                <TiShoppingCart />
                <span className="count">{cartItems.length}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
