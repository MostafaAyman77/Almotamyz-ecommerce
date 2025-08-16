import React, { useEffect, useState } from "react";
import axios from "axios";
import { CircularProgress, Box } from "@mui/material";
import Header from "../../components/Utility/Header/Header";
import ProductsContainer from "../../components/Products/ProductsContainer";
import ImageLogo from "../../assets/Images/brand1.png";
const StorePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/products"
        );

        const productsData = response.data.data;

        setProducts(
          productsData.map((item) => ({
            id: item._id,
            title: item.title,
            imageCover: item.imageCover,
            price: item.price,
            priceAfterDiscount: item.priceAfterDiscount || null,
            quantity: item.quantity,
            ratingsQuantity: item.ratingsQuantity || 0,
          }))
        );
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      </div>
    );
  }

  return (
    <>
      <div className="container">
        <Header />
        <ProductsContainer products={products} />
      </div>
    </>
  );
};

export default StorePage;
