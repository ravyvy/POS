import React from "react";
import { useCart } from "../../context/CartContext";

export const Receipt = () => {
  const { state, subtotal, discountAmount, discountedSubtotal, tax, total } = useCart();
  const date = new Date().toLocaleString();

  return (
    <div id="printable-receipt" className="hidden print:block bg-white text-black p-8 font-mono text-sm max-w-sm mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-1">BEAN & BREW</h1>
        <p>123 Coffee Street</p>
       
      </div>
      
      <div className="border-t border-b border-dashed border-gray-400 py-3 mb-4 space-y-3">
        {state.items.map((item) => (
           <div key={item.id}>
             <div className="flex justify-between font-bold">
               <span>{item.quantity}x {item.name}</span>
               <span>${(item.total_price * item.quantity).toFixed(2)}</span>
             </div>
             {item.selected_options.length > 0 && (
               <div className="text-xs text-gray-600 pl-4 mt-1">
                 {item.selected_options.map(opt => (
                    <div key={opt.option_id}>
                      - {opt.option_name} {opt.extra_price > 0 ? `(+$${opt.extra_price.toFixed(2)})` : ''}
                    </div>
                 ))}
               </div>
             )}
           </div>
        ))}
      </div>
      
      <div className="space-y-1 mb-4">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {state.discount && (
          <>
            <div className="flex justify-between text-gray-800 font-medium">
              <span>Discount:</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Discounted Subtotal:</span>
              <span>${discountedSubtotal.toFixed(2)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Tax (8%):</span>
          <span>${tax.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 pt-2 flex justify-between font-bold text-lg mb-8">
        <span>Total:</span>
        <span>${total.toFixed(2)}</span>
      </div>
      
      <div className="text-center text-gray-500 text-xs">
        <p>Thank you for your visit!</p>
        <p>Please come again.</p>
      </div>
    </div>
  );
};
