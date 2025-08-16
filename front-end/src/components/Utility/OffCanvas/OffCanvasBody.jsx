import React, { useState } from "react";
import { motion } from "framer-motion";
import "./OffCanvasBody.css"; // ملف CSS خارجي للتنسيق

const tabs = ["الفئات", "القائمة"];

const OffCanvasBody = () => {
  const [selected, setSelected] = useState("الفئات");

  return (
    <div className="offcanvas-body-wrapper">
      {/* Search Box */}
      <div className="search-box mb-4">
        <input type="text" className="form-control" placeholder="ابحث هنا..." />
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelected(tab)}
            className={`tab-btn ${selected === tab ? "active" : ""}`}
          >
            {selected === tab && (
              <motion.div
                className="active-bg"
                layoutId="underline"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="tab-text">{tab}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="tab-content mt-3">
        <p>{selected}</p>
      </div>
    </div>
  );
};

export default OffCanvasBody;
