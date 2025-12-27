"use client";

import ProductCard from "@/components/ProductCard";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import Styles from "./style.module.css";


const Favorites = () => {

    const favorites = useSelector((state: RootState) => state.cart.favorites);


    return (
        <div>
            <div className="category-products favorites-page">
                <div className="container">
                    <div className={`${Styles["top-slide"]}`}>
                        <h2>المفضلة لديك</h2>
                    </div>
                    {favorites.length === 0 ? (
                        <p>لا توجد منتجات مفضلة حتى الآن.</p>
                    ) : (
                        <div className={`${Styles["products"]}`}>
                            {favorites.map(item => (
                                <ProductCard item={item} key={item.id} />
                            ) )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Favorites