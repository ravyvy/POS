import React from "react";

export const ProductCard = ({ product, onClick }) => {
  return (
    <div
      onClick={() => onClick(product)}
      className="group relative flex cursor-pointer select-none flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl active:scale-95"
    >
      {/* Product Image */}
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gray-50">
        <img
          src={product.image || "https://via.placeholder.com/150"}
          alt={product.product_name || product.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/150";
          }}
          className="h-32 w-32 object-fill transition-transform duration-300 group-hover:scale-110"
        />

        {/* Price Badge */}
        <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
          ${parseFloat(product.base_price || 0).toFixed(2)}
        </span>
      </div>

      {/* Content */}
      <div className="flex items-center justify-between p-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold  text-gray-800 transition-colors group-hover:text-amber-600">
            {product.product_name || product.name}
          </h3>

          <p className="mt-1 text-xs text-gray-400">
            Tap to add
          </p>
        </div>

        {/* Add Button */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-600 transition-all duration-300 group-hover:bg-amber-500 group-hover:text-white"
        >
          +
        </button>
      </div>
    </div>
  );
};
