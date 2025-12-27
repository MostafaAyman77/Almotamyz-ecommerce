"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  cartTotalPrice
} from "@/store/slices/cartSlice";
import { FaTrashAlt } from "react-icons/fa";
import Styles from "./style.module.css";

const Cart = () => {
  const dispatch = useDispatch();

  const cartItems = useSelector(
    (state: RootState) => state.cart.cartItems
  );

  const total = useSelector(cartTotalPrice);

  return (
    <div className={`${Styles["checkout"]}`}>
      <div className={`${Styles["order-summary"]}`}>
        <div className={`${Styles["cart-header"]}`}>
          <h1>ملخص طلبك</h1>
          <button 
            className={`${Styles["delete-all"]}`} 
            onClick={() => dispatch(clearCart())}
          >
            حذف الكل
          </button>  
          </div>

        <div className={`${Styles["items"]}`}>
          {cartItems.length === 0 ? (
            <p>العربة الخاصة بك فارغة</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className={`${Styles["item-cart"]}`}>
                <div className={`${Styles["image-item"]}`}>
                  <div className={`${Styles["image"]}`}>
                    <img src={item.images[0]} alt={item.title} />
                  </div>

                  <div className={`${Styles["content"]}`}>
                    <h4>{item.title}</h4>
                    <p className={`${Styles["price-item"]}`}>${item.price}</p>

                    <div className={`${Styles["quantity-control"]}`}>
                      <button
                        onClick={() =>
                          dispatch(decreaseQuantity(item.id))
                        }
                      >
                        -
                      </button>

                      <span className={`${Styles["quantity"]}`}>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          dispatch(increaseQuantity(item.id))
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  className={`${Styles["delete"]}`}
                  onClick={() =>
                    dispatch(removeFromCart(item.id))
                  }
                >
                  <FaTrashAlt />
                </button>
              </div>
            ))
          )}
        </div>

        <div className={`${Styles["bottom-summary"]}`}>
          <div className={`${Styles["shop-table"]}`}>
            <p>مجموع المبلغ:</p>
            <span className={`${Styles["total-checkout"]}`}>
              {total.toFixed(2)}
              ج.م
            </span>
          </div>

          <div className={`${Styles["btn-checkout"]}`}>
            <button type="submit">اطلب الآن</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
