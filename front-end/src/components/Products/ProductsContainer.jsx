import React from "react";
import ProductCard from "./ProductCard";
import Styles from "./ProductContainer.module.css";
import { motion } from "framer-motion";
const ProductsContainer = ({ products }) => {
  return (
    <div className={Styles["product-container"]}>
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <ProductCard key={product.id} {...product} />
        </motion.div>
      ))}
    </div>
  );
};

export default ProductsContainer;
