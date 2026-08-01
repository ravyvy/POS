import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCart } from "../../context/CartContext";

export const OptionModal = ({ product, onClose }) => {
  const { dispatch } = useCart();
  const [selectedOptions, setSelectedOptions] = useState({});
  const [optionGroups, setOptionGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        // ensure we use the correct product id if named differently
        const productId = product.id || product.product_id;
        const res = await fetch(`http://localhost:5000/option_product/${productId}`);
        const data = await res.json();
        
        if (data.success && data.product_options) {
          const mappedGroups = data.product_options.map(opt => ({
            id: opt.option_id,
            name: opt.option_name,
            is_required: opt.is_required,
            allow_multiple: false, // default as it's not in db schema
            options: opt.option_values.map(val => ({
              id: val.option_value_id,
              name: val.option_value_name,
              extra_price: Number(val.extra_price) || 0
            }))
          }));
          setOptionGroups(mappedGroups);

          // Initialize required options
          const initialSelections = {};
          mappedGroups.forEach((group) => {
            if (group.is_required && !group.allow_multiple && group.options.length > 0) {
              initialSelections[group.id] = group.options[0].id;
            } else if (group.allow_multiple) {
              initialSelections[group.id] = [];
            }
          });
          setSelectedOptions(initialSelections);
        }
      } catch (err) {
        console.error("Error fetching options:", err);
      } finally {
        setLoading(false);
      }
    };
    if (product) {
      fetchOptions();
    }
  }, [product]);

  const handleOptionChange = (groupId, optionId, allowMultiple) => {
    setSelectedOptions((prev) => {
      if (allowMultiple) {
        const currentSelected = prev[groupId] || [];
        if (currentSelected.includes(optionId)) {
          return { ...prev, [groupId]: currentSelected.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [groupId]: [...currentSelected, optionId] };
        }
      } else {
        return { ...prev, [groupId]: optionId };
      }
    });
  };

  const calculateTotalPrice = () => {
    let extra = 0;
    optionGroups.forEach((group) => {
      const selected = selectedOptions[group.id];
      if (selected) {
        if (Array.isArray(selected)) {
          selected.forEach((optId) => {
            const opt = group.options.find((o) => o.id === optId);
            if (opt) extra += opt.extra_price;
          });
        } else {
          const opt = group.options.find((o) => o.id === selected);
          if (opt) extra += opt.extra_price;
        }
      }
    });
    return (Number(product.base_price) || 0) + extra;
  };

  const handleAddToCart = () => {
    // Check if all required groups are selected
    for (const group of optionGroups) {
      if (group.is_required) {
        const selected = selectedOptions[group.id];
        if (!selected || (Array.isArray(selected) && selected.length === 0)) {
          alert(`Please select an option for ${group.name}`);
          return;
        }
      }
    }

    const formattedSelectedOptions = [];
    
    optionGroups.forEach((group) => {
      const selected = selectedOptions[group.id];
      if (selected) {
        if (Array.isArray(selected)) {
          selected.forEach((optId) => {
            const opt = group.options.find((o) => o.id === optId);
            if (opt) {
              formattedSelectedOptions.push({
                group_id: group.id,
                group_name: group.name,
                option_id: opt.id,
                option_name: opt.name,
                extra_price: opt.extra_price,
              });
            }
          });
        } else {
          const opt = group.options.find((o) => o.id === selected);
          if (opt) {
            formattedSelectedOptions.push({
              group_id: group.id,
              group_name: group.name,
              option_id: opt.id,
              option_name: opt.name,
              extra_price: opt.extra_price,
            });
          }
        }
      }
    });

    const productId = product.id || product.product_id;
    const productName = product.name || product.product_name;
    const uniqueId = `${productId}-${Date.now()}`;

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: uniqueId,
        product_id: productId,
        name: productName,
        base_price: Number(product.base_price) || 0,
        quantity: 1,
        selected_options: formattedSelectedOptions,
        total_price: calculateTotalPrice(),
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 relative">
          <h2 className="text-2xl font-bold text-gray-800 pr-10">{product.name || product.product_name} Options</h2>
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        {loading ? (
          <div className="p-6 flex-1 flex items-center justify-center min-h-[200px]">
             <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-gray-50/50">
            {optionGroups.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No options available for this product.</div>
            ) : (
              optionGroups.map((group) => (
                <div key={group.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-2 mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{group.name}</h3>
                    {group.is_required ? (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">Required</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-medium">Optional</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {group.options.map((option) => {
                      const isSelected = group.allow_multiple
                        ? (selectedOptions[group.id] || []).includes(option.id)
                        : selectedOptions[group.id] === option.id;

                      return (
                        <label
                          key={option.id}
                          onClick={() => handleOptionChange(group.id, option.id, group.allow_multiple)}
                          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                            isSelected
                              ? "border-amber-600 bg-amber-50"
                              : "border-gray-100 bg-white hover:border-amber-200 hover:bg-amber-50/50"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 flex items-center justify-center rounded border ${group.allow_multiple ? 'rounded' : 'rounded-full'} ${
                              isSelected ? "border-amber-600 bg-amber-600" : "border-gray-300 bg-white"
                            }`}>
                              {isSelected && (
                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className={`font-medium ${isSelected ? "text-amber-900" : "text-gray-700"}`}>
                              {option.name}
                            </span>
                          </div>
                          {option.extra_price > 0 && (
                            <span className="text-sm font-bold text-gray-500">
                              +${option.extra_price}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-6 bg-white border-t border-gray-100">
          <button
            onClick={handleAddToCart}
            className="w-full bg-amber-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-amber-600/30 hover:bg-amber-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-600/40 transition-all duration-300 flex justify-between px-8 items-center"
          >
            <span>Add to Cart</span>
            <span>${calculateTotalPrice()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
