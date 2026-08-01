import React from "react";

export const CategoryFilter = ({
  categories = [],
  activeCategory,
  onSelectCategory,
  onSearch,
}) => {
  return (
    <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide items-center ">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-6 py-3 rounded-2xl whitespace-nowrap font-medium transition-all duration-200 ${activeCategory === category
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
            }`}
        >
          {category}
        </button>
      ))}
      {/* search input */}
      <div>
        <input
          type="text"
          placeholder="Search"
          className="px-4 py-2 rounded-2xl border border-gray-100 focus:outline-none focus:border-amber-600 transition-colors"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
};
