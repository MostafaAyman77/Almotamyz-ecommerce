import React from "react";
import CategoryCard from "./CategoryCard";
import SubTitle from "../Utility/SubTitle/SubTitle";

const CategoryContainer = () => {
  return (
    <>
      <div className="container">
        <SubTitle title="الفئات" btnTitle="عرض الكل" />
        <div className="d-flex flex-wrap justify-content-between gap-3">
          <CategoryCard />
          <CategoryCard />
          <CategoryCard />
          <CategoryCard />
          <CategoryCard />
        </div>
      </div>
    </>
  );
};

export default CategoryContainer;
