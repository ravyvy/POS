"use client";

import React, { useState, useMemo , useEffect } from "react";
import { Coffee } from "lucide-react";
import { CartProvider } from "../src/context/CartContext";
import { CategoryFilter } from "../src/components/pos/CategoryFilter";
import { ProductCard } from "../src/components/pos/ProductCard";
import { CartSidebar } from "../src/components/pos/CartSidebar";
import { OptionModal } from "../src/components/pos/OptionModal";
import { PaymentModal } from "../src/components/pos/PaymentModal";
import { Receipt } from "../src/components/pos/Receipt";
import "../app/globals.css";

function POSApp() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [apiData, setApiData] = useState([]);
  const [categories, setCategories] = useState(["All"]);

  // get api
  const api_base_url = "http://localhost:5000";
  // get data from api
  const category_products = async () => {
    try{
      const response = await fetch(`${api_base_url}/category_with_products`);
      const data = await response.json();
      console.log(data);
      if (data.success) {
        setApiData(data.categories);
        const catNames = ["All", ...data.categories.map(c => c.category_name)];
        setCategories(catNames);
      }
      return data;
    }catch(err){
      console.log(err);
    }
  }
  useEffect(() => {
    category_products();
  }, []);
  // Filter products based on category and search query
  const filteredProducts = useMemo(() => {
    let products = [];
    if (activeCategory === "All") {
      products = apiData.flatMap(c => 
        (c.products || []).map(p => ({
          ...p,
          name: p.product_name,
          category: c.category_name,
          option_groups: []
        }))
      );
    } else {
      const category = apiData.find(c => c.category_name === activeCategory);
      if (category && category.products) {
        products = category.products.map(p => ({
          ...p,
          name: p.product_name,
          category: category.category_name,
          option_groups: []
        }));
      }
    }

    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(lowerQuery));
    }

    return products;
  }, [activeCategory, apiData, searchQuery]);
  
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900 font-sans">
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Navigation / Header */}
        <header className="bg-white px-8 py-5 flex items-center justify-between border-b border-gray-100 shadow-sm z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-600 text-white p-2.5 rounded-xl shadow-md">
              <Coffee size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Bean & Brew</h1>
              <p className="text-sm font-medium text-gray-500">Point of Sale System</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-gray-700">System Online</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col px-8 pt-6 pb-2">
          
          {/* Categories */}
          <div className="mb-6 shrink-0">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Categories</h2>
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              onSearch={setSearchQuery}
            />
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto pb-10 scrollbar-hide">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={(prod) => {
                    if (prod.option_groups && prod.option_groups.length > 0) {
                      setSelectedProduct(prod);
                    } else {
                      setSelectedProduct(prod);
                    }
                  }}
                />
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Right Sidebar - Cart */}
      <aside className="h-full">
        <CartSidebar onCheckout={() => setIsCheckoutOpen(true)} />
      </aside>

      {/* Modals */}
      {selectedProduct && (
        <OptionModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {isCheckoutOpen && (
        <PaymentModal
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={() => setIsCheckoutOpen(false)}
         
        />
      )}
      
      {/* Hidden Receipt for Printing */}
      <Receipt />
    </div>
  );
}

export default function Page() {
  return (
    <CartProvider>
      <POSApp />
    </CartProvider>
  );
}
