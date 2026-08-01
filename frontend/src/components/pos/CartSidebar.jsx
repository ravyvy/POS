import React, { useState } from "react";
import { ShoppingBag, Trash2, Tag, X } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { CartItem } from "./CartItem";

export const CartSidebar = ({ onCheckout }) => {
  const { state, dispatch, subtotal, discountAmount, discountedSubtotal, tax, total } = useCart();
  const [showDiscountMenu, setShowDiscountMenu] = useState(false);
  const [discountType, setDiscountType] = useState('percentage');
  const [customDiscount, setCustomDiscount] = useState('');

  const applyDiscount = (type, value) => {
    dispatch({ type: "SET_DISCOUNT", payload: { type, value } });
    setShowDiscountMenu(false);
    setCustomDiscount('');
  };

  const handleApplyCustomDiscount = () => {
    const val = parseFloat(customDiscount);
    if (!isNaN(val) && val > 0) {
      applyDiscount(discountType, val);
    }
  };

  const removeDiscount = () => {
    dispatch({ type: "REMOVE_DISCOUNT" });
    setShowDiscountMenu(false);
  };

  return (
    <div className="w-[400px] bg-white shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] flex flex-col h-full z-10">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="text-amber-600" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Current Order</h2>
        </div>
        {state.items.length > 0 && (
          <button
            onClick={() => dispatch({ type: "CLEAR_CART" })}
            className="text-gray-400 hover:text-red-500 transition-colors flex items-center space-x-1 text-sm font-medium"
          >
            <Trash2 size={16} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50 ">
        {state.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
            <ShoppingBag size={48} className="opacity-20" />
            <p className="text-lg font-medium">Cart is empty</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {state.items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Discount Menu Overlay */}
      {showDiscountMenu && (
        <div className="p-5 bg-amber-50 border-t border-amber-100 relative shadow-inner">
          <button
            onClick={() => setShowDiscountMenu(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-white p-1 rounded-full shadow-sm"
          >
            <X size={16} />
          </button>
          <h4 className="text-base font-black text-amber-900 mb-4">Apply Discount</h4>

          {/* Toggle Type */}
          <div className="flex bg-white rounded-xl border border-amber-200 overflow-hidden mb-4 shadow-sm">
            <button
              className={`flex-1 py-2 text-sm font-bold transition-colors ${discountType === 'percentage' ? 'bg-amber-500 text-white' : 'text-amber-700 hover:bg-amber-50'}`}
              onClick={() => setDiscountType('percentage')}
            >
              Percentage (%)
            </button>
            <button
              className={`flex-1 py-2 text-sm font-bold transition-colors ${discountType === 'fixed' ? 'bg-amber-500 text-white' : 'text-amber-700 hover:bg-amber-50'}`}
              onClick={() => setDiscountType('fixed')}
            >
              Amount ($)
            </button>
          </div>

          {/* Custom Input */}
          <div className="flex space-x-2 mb-5">
            <div className="relative flex-1">
              {discountType === 'fixed' && (
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-bold">$</span>
                </div>
              )}
              <input
                type="number"
                value={customDiscount}
                onChange={(e) => setCustomDiscount(e.target.value)}
                className={`block w-full ${discountType === 'fixed' ? 'pl-8' : 'pl-4'} pr-8 py-3 border-2 border-amber-200 rounded-xl text-lg font-bold text-gray-900 focus:ring-0 focus:border-amber-500 transition-colors bg-white`}
                placeholder={discountType === 'percentage' ? "0" : "0.00"}
              />
              {discountType === 'percentage' && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-bold">%</span>
                </div>
              )}
            </div>
            <button
              onClick={handleApplyCustomDiscount}
              disabled={!customDiscount || parseFloat(customDiscount) <= 0}
              className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              Apply
            </button>
          </div>

          <h5 className="text-xs font-bold text-amber-800/60 mb-2 uppercase tracking-wider">Quick Presets</h5>
          <div className="flex flex-wrap gap-2 mb-2">
            <button onClick={() => applyDiscount('percentage', 5)} className="px-4 py-2 bg-white border border-amber-200 rounded-xl text-sm font-bold text-amber-700 hover:bg-amber-100 hover:border-amber-300 transition-colors shadow-sm">5%</button>
            <button onClick={() => applyDiscount('percentage', 10)} className="px-4 py-2 bg-white border border-amber-200 rounded-xl text-sm font-bold text-amber-700 hover:bg-amber-100 hover:border-amber-300 transition-colors shadow-sm">10%</button>
            <button onClick={() => applyDiscount('percentage', 15)} className="px-4 py-2 bg-white border border-amber-200 rounded-xl text-sm font-bold text-amber-700 hover:bg-amber-100 hover:border-amber-300 transition-colors shadow-sm">15%</button>
            <button onClick={() => applyDiscount('percentage', 20)} className="px-4 py-2 bg-white border border-amber-200 rounded-xl text-sm font-bold text-amber-700 hover:bg-amber-100 hover:border-amber-300 transition-colors shadow-sm">20%</button>
            <button onClick={() => applyDiscount('fixed', 0.50)} className="px-4 py-2 bg-white border border-amber-200 rounded-xl text-sm font-bold text-amber-700 hover:bg-amber-100 hover:border-amber-300 transition-colors shadow-sm">-$0.50</button>
            <button onClick={() => applyDiscount('fixed', 1.00)} className="px-4 py-2 bg-white border border-amber-200 rounded-xl text-sm font-bold text-amber-700 hover:bg-amber-100 hover:border-amber-300 transition-colors shadow-sm">-$1.00</button>
          </div>

          {state.discount && (
            <button onClick={removeDiscount} className="mt-4 w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors border border-red-100">
              Clear Current Discount
            </button>
          )}
        </div>
      )}

      {/* Summary & Checkout */}
      <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.05)] rounded-t-3xl relative">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span className="font-medium text-gray-700">${subtotal.toFixed(2)}</span>
          </div>

          {/* Discount Section */}
          {state.discount ? (
            <div className="flex justify-between text-green-600">
              <div className="flex items-center space-x-1 cursor-pointer hover:text-green-700" onClick={() => setShowDiscountMenu(!showDiscountMenu)}>
                <span>Discount ({state.discount.type === 'percentage' ? `${state.discount.value}%` : 'Fixed'})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                <button onClick={removeDiscount} className="text-gray-300 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full p-1 transition-colors" aria-label="Remove discount">
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between text-gray-500">
              <button
                onClick={() => setShowDiscountMenu(!showDiscountMenu)}
                className="flex items-center space-x-1.5 text-amber-600 hover:text-amber-700 font-bold text-sm transition-colors bg-amber-50 px-3 py-1.5 rounded-lg"
              >
                <Tag size={14} />
                <span>Apply Discount</span>
              </button>
            </div>
          )}

          {state.discount && (
            <div className="flex justify-between text-gray-500 text-sm">
              <span>Discounted Subtotal</span>
              <span className="font-medium text-gray-700">${discountedSubtotal.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-500">
            <span>Tax (8%)</span>
            <span className="font-medium text-gray-700">${tax.toFixed(2)}</span>
          </div>
          <div className="h-px bg-gray-100 w-full my-2"></div>
          <div className="flex justify-between text-xl font-bold text-gray-900">
            <span>Total</span>
            <span className="text-amber-600">${total.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={onCheckout}
          disabled={state.items.length === 0}
          className="w-full bg-amber-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-amber-600/30 hover:bg-amber-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-600/40 disabled:opacity-50 disabled:hover:-translate-y-0 disabled:hover:shadow-none transition-all duration-300"
        >
          PAY / CHECKOUT
        </button>
      </div>
    </div>
  );
};
