"use client";

import React, { createContext, useReducer, useContext } from "react";

// Helper function to check if two selected options arrays are identical
const areOptionsEqual = (opts1, opts2) => {
  if (opts1.length !== opts2.length) return false;
  
  // Create arrays of option_ids for comparison
  const ids1 = opts1.map(o => o.option_id).sort();
  const ids2 = opts2.map(o => o.option_id).sort();
  
  for (let i = 0; i < ids1.length; i++) {
    if (ids1[i] !== ids2[i]) return false;
  }
  
  return true;
};

// Initial state
const initialState = {
  items: [],
  discount: null,
};

// Reducer function
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM":
      // Check for existing item with identical product_id and selected_options
      const existingItemIndex = state.items.findIndex(
        (item) => 
          item.product_id === action.payload.product_id &&
          areOptionsEqual(item.selected_options, action.payload.selected_options)
      );

      if (existingItemIndex !== -1) {
        // If match found, increase quantity instead of adding new row
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity,
        };
        return {
          ...state,
          items: updatedItems,
        };
      }

      // If no match found, append as new row
      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id),
      };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        discount: null,
      };
    case "SET_DISCOUNT":
      return {
        ...state,
        discount: action.payload,
      };
    case "REMOVE_DISCOUNT":
      return {
        ...state,
        discount: null,
      };
    default:
      return state;
  }
}

const CartContext = createContext(undefined);

// Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Computed values
  const subtotal = state.items.reduce(
    (acc, item) => acc + item.total_price * item.quantity,
    0
  );

  let discountAmount = 0;
  if (state.discount) {
    if (state.discount.type === 'percentage') {
      discountAmount = subtotal * (state.discount.value / 100);
    } else {
      discountAmount = state.discount.value;
    }
  }

  // Ensure discount doesn't make subtotal negative
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  const taxRate = 0.08; // 8% tax rate as a mockup
  const tax = discountedSubtotal * taxRate;
  const total = discountedSubtotal + tax;

  return (
    <CartContext.Provider value={{ 
      state, 
      dispatch, 
      subtotal, 
      discountAmount, 
      discountedSubtotal, 
      tax, 
      total 
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
