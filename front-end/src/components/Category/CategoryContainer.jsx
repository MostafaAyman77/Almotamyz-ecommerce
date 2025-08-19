import React, { useEffect } from "react";
import CategoryCard from "./CategoryCard";
import SubTitle from "../Utility/SubTitle/SubTitle";
import AxiosClient from "../../../Services/AxiosClient";

const CategoryContainer = () => {
  const [categories, setCategories] = React.useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await AxiosClient.get("/categories");

        const categoriesData = response.data.data;
        // console.log(categoriesData);

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
    <>
      <div className="container">
        <SubTitle title="الفئات" btnTitle="عرض الكل" />
        <div className="d-flex flex-wrap justify-content-between gap-3">
          {categories.map((category) => {
            // console.log(category);
            return (
              <CategoryCard
                key={category.id}
                image={category.image}
                title={category.name}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CategoryContainer;
