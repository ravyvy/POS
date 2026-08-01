import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "../../context/CartContext";

export const CartItem = ({ item }) => {
  const { dispatch } = useCart();

  const handleIncrease = () => {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { id: item.id, quantity: item.quantity + 1 },
    });
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { id: item.id, quantity: item.quantity - 1 },
      });
    }
  };

  const handleRemove = () => {
    dispatch({ type: "REMOVE_ITEM", payload: { id: item.id } });
  };

  return (
    <div className="flex flex-col bg-white border-b border-gray-100 p-4 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 pr-3">
          <h4 className="font-bold text-gray-800">{item.name}</h4>
          {item.selected_options.length > 0 && (
            <div className="text-xs text-gray-500 mt-1 space-y-0.5">
              {item.selected_options.map((opt, index) => (
                <div key={index} className="flex justify-between">
                  <span>
                    - {opt.option_name}
                  </span>
                  {opt.extra_price > 0 && (
                    <span>+${opt.extra_price.toFixed(2)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="font-bold text-gray-800 block">
            ${(item.total_price * item.quantity).toFixed(2)}
          </span>
          <span className="text-xs text-gray-400">
            ${item.total_price} each
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 border-dashed">
        <button
          onClick={handleRemove}
          className="text-red-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
          aria-label="Remove item"
        >
          <Trash2 size={16} />
        </button>

        <div className="flex items-center bg-gray-100 rounded-full p-0.5">
          <button
            onClick={handleDecrease}
            disabled={item.quantity <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-bold text-gray-800">
            {item.quantity}
          </span>
          <button
            onClick={handleIncrease}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-white hover:shadow-sm transition-all"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
