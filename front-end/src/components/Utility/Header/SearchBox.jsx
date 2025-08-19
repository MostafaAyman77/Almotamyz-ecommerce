import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";

const SearchBox = () => {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?query=${encodeURIComponent(search.trim())}`);
    }
    setSuggestions([]);
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!search.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(
          `https://dummyjson.com/products/search?q=${search}`
        );
        const data = await res.json();
        setSuggestions(data.products.slice(0, 5) || []);
      } catch (error) {
        console.log("Error fetching suggestions", error);
        setSuggestions([]);
      }
    };
    if (search.trim()) {
      fetchSuggestions();
    }
    const debouncedFetch = setTimeout(() => {
      fetchSuggestions();
    }, 300);
    return () => clearTimeout(debouncedFetch);
  }, [search]);

  // console.log(suggestions);

  useEffect(() => {
    setSuggestions([]);
  }, [location]);

  return (
    <div>
      <div className="search-box-container">
        <form action="" className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            name="search"
            id="search"
            placeholder="البحث عن المنتجات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
          <button type="submit">
            <FaSearch />
          </button>
        </form>
        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((item, index) => (
              <Link to={`/products/${item.id}`}>
                <li key={index}>
                  <img src={item.images[0]} alt="" />
                  <span>{item.title}</span>
                </li>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
