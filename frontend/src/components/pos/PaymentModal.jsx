import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, CheckCircle2, Delete, QrCode, Banknote, RefreshCw } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { QRCodeSVG } from "qrcode.react";

export const PaymentModal = ({ onClose, onSuccess }) => {
  const { total, dispatch } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  // State for Cash Payment
  const [cashReceivedUSD, setCashReceivedUSD] = useState("");
  const [cashReceivedKHR, setCashReceivedKHR] = useState("");
  const [activeInput, setActiveInput] = useState("USD");
  const [isProcessing, setIsProcessing] = useState(false);

  // State for KHQR Payment
  const [qrString, setQrString] = useState("");
  const [qrError, setQrError] = useState("");
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [md5Hash, setMd5Hash] = useState("");
  
  // 🟢 ថែម Ref ការពារការហៅ Print ជាន់គ្នា
  const isPaidRef = useRef(false);

  const EXCHANGE_RATE = 4100;

  const parsedUSD = parseFloat(cashReceivedUSD) || 0;
  const parsedKHR = parseFloat(cashReceivedKHR) || 0;

  const totalCashUSD = parsedUSD + parsedKHR / EXCHANGE_RATE;
  const changeUSD = totalCashUSD - total;
  const changeKHR = Math.round((changeUSD * EXCHANGE_RATE) / 100) * 100;
  const totalKHR = Math.round((total * EXCHANGE_RATE) / 100) * 100;

  const isSufficient = paymentMethod === "KHQR" ? true : totalCashUSD >= total;

  // 🟢 1. Wrapped handleConfirm with useCallback
  const handleConfirm = useCallback(() => {
    if (!isSufficient || isProcessing) return;

    setIsProcessing(true);
    setTimeout(() => {
      window.print();
      dispatch({ type: "CLEAR_CART" });
      onSuccess();
    }, 1500);
  }, [isSufficient, isProcessing, dispatch, onSuccess]);

  // Call this function when Cashier clicks "Confirm & Print"
async function handleConfirmAndPrint(cartItems, subtotal, discount, tax, total, paid, change, method = 'SCAN_PAY') {
    try {
        const response = await fetch('http://localhost:5000/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: 1, // Cashier User ID
                cart: cartItems,
                subtotal: subtotal,
                discount: discount,
                tax: tax,
                total_amount: total,
                paid_amount: paid,
                change_amount: change,
                payment_method: method
            })
        });

        const data = await response.json();

        if (data.success && data.should_print) {
            console.log("Order saved! Printing receipt:", data.print_data);
            
            // Trigger thermal auto print window
            window.print();
        } else {
            alert("Order failed: " + data.error);
        }
    } catch (error) {
        console.error("API Error:", error);
    }
}
  // 🟢 2. Generate KHQR
  const generateWingKHQR = useCallback(async () => {
    try {
      setQrError("");
      setIsLoadingQR(true);
      isPaidRef.current = false; // Reset payment state
      const parsedAmount = parseFloat(total);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setQrError("ចំនួនទឹកប្រាក់មិនត្រឹមត្រូវ");
        setIsLoadingQR(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/generate-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedAmount }),
      });

      const data = await response.json();

      if (data.success && data.qr) {
        setQrString(data.qr);
        setMd5Hash(data.md5 || "");
        setQrError("");
      } else {
        setQrError(data.message || "មិនអាចបង្កើត QR Code បានទេ");
      }
    } catch (error) {
      console.error("KHQR Fetch Error:", error);
      setQrError("មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ");
    } finally {
      setIsLoadingQR(false);
    }
  }, [total]);

  // 🟢 3. Fixed Auto Polling & Trigger Print
  useEffect(() => {
    let interval;
    if (paymentMethod === "KHQR" && qrString && md5Hash && !isPaidRef.current) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/check-status/${md5Hash}`);
          const statusData = await res.json();
          
          // ឆែកមើល response ឲ្យត្រូវរវាង backend និង frontend (paid === true ឬ status === 'PAID')
          if ((statusData.paid || statusData.status === "PAID" || statusData.success) && !isPaidRef.current) {
            isPaidRef.current = true;
            clearInterval(interval);
            handleConfirm(); // Auto redirect to print!
          }
        } catch (err) {
          console.error("Checking payment status error:", err);
        }
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [paymentMethod, qrString, md5Hash, handleConfirm]);

  useEffect(() => {
    if (paymentMethod === "KHQR" && total > 0) {
      generateWingKHQR();
    } else {
      setQrString("");
      setQrError("");
      setMd5Hash("");
    }
  }, [paymentMethod, total, generateWingKHQR]);

  const handleQuickCashUSD = (amount) => {
    setCashReceivedUSD((prev) => (parseFloat(prev || "0") + amount).toString());
    setActiveInput("USD");
  };

  const handleQuickCashKHR = (amount) => {
    setCashReceivedKHR((prev) => (parseFloat(prev || "0") + amount).toString());
    setActiveInput("KHR");
  };

  const handleExactCash = () => {
    setCashReceivedUSD(total.toFixed(2));
    setCashReceivedKHR("");
    setActiveInput("USD");
  };

  const handleNumpadClick = (val) => {
    const setCash = activeInput === "USD" ? setCashReceivedUSD : setCashReceivedKHR;
    const cash = activeInput === "USD" ? cashReceivedUSD : cashReceivedKHR;

    if (val === "backspace") {
      setCash((prev) => prev.slice(0, -1));
    } else if (val === ".") {
      if (!cash.includes(".")) {
        setCash((prev) => (prev ? prev + "." : "0."));
      }
    } else {
      setCash((prev) => {
        if (prev === "0") return val;
        return prev + val;
      });
    }
  };

  const handleClearInput = () => {
    if (activeInput === "USD") setCashReceivedUSD("");
    else setCashReceivedKHR("");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 relative">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
            <div className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
              Rate: $1 = {EXCHANGE_RATE.toLocaleString()} ៛
            </div>
          </div>

          <div className="flex bg-gray-200/80 p-1 rounded-2xl gap-1">
            <button
              onClick={() => setPaymentMethod("CASH")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                paymentMethod === "CASH"
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Banknote size={18} />
              Cash
            </button>
            <button
              onClick={() => setPaymentMethod("KHQR")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                paymentMethod === "KHQR"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <QrCode size={18} />
              KHQR Scan
            </button>
          </div>

          {!isProcessing && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-2 rounded-full transition-colors shadow-sm"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col md:flex-row min-h-[420px]">
          {isProcessing ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-20 h-20 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
              <p className="text-xl font-bold text-gray-700 animate-pulse">Processing Payment...</p>
              <p className="text-gray-400">Preparing Receipt & Printing</p>
            </div>
          ) : (
            <>
              {/* Left Column: Order Summary */}
              <div className="flex-1 p-8 bg-gray-50 flex flex-col justify-between border-r border-gray-100">
                <div>
                  <p className="text-gray-500 mb-2 font-medium text-lg">Total Amount Due</p>
                  <div className="flex items-baseline space-x-3 flex-wrap">
                    <h1 className="text-6xl font-black text-gray-900 tracking-tight">
                      ${total.toFixed(2)}
                    </h1>
                    <span className="text-2xl font-bold text-gray-400 whitespace-nowrap mt-2">
                      / {totalKHR.toLocaleString()} ៛
                    </span>
                  </div>
                </div>

                {/* Change Info */}
                {paymentMethod === "CASH" ? (
                  <div className="space-y-4 mt-12">
                    <div
                      className={`p-6 rounded-2xl transition-colors ${
                        totalCashUSD === 0
                          ? "bg-white border border-gray-200"
                          : isSufficient
                          ? "bg-green-100 border-2 border-green-200"
                          : "bg-red-50 border border-red-100"
                      }`}
                    >
                      <p className={`font-bold mb-2 ${
                        totalCashUSD === 0 ? "text-gray-500" : isSufficient ? "text-green-700" : "text-red-700"
                      }`}>
                        Change Due
                      </p>
                      <div className="flex items-baseline space-x-3 flex-wrap">
                        <p className={`text-4xl font-black ${
                          totalCashUSD === 0 ? "text-gray-900" : isSufficient ? "text-green-700" : "text-red-700"
                        }`}>
                          ${isSufficient ? changeUSD.toFixed(2) : "0.00"}
                        </p>
                        <span className={`text-xl font-bold whitespace-nowrap mt-2 ${
                          totalCashUSD === 0 ? "text-gray-400" : isSufficient ? "text-green-600/70" : "text-red-600/70"
                        }`}>
                          / {isSufficient ? changeKHR.toLocaleString() : "0"} ៛
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-red-50 border border-red-100 rounded-2xl mt-12">
                    <p className="text-red-700 font-bold mb-1">KHQR Payment</p>
                    <p className="text-sm text-red-600/80">
                      ប្រព័ន្ធនឹងដឹងដោយស្វ័យប្រវត្តិពេលអតិថិជន Scan រួច ហើយនឹងបើកផ្ទាំង Print ជូនភ្លាមៗ។
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                  <button
                    onClick={handleConfirm}
                    disabled={!isSufficient}
                    className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold text-xl shadow-lg shadow-gray-900/20 hover:bg-black hover:-translate-y-1 disabled:opacity-50 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 size={28} />
                    <span >Confirm & Print</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full bg-white text-gray-600 border-2 border-gray-200 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Right Column */}
              {paymentMethod === "CASH" ? (
                /* CASH NUMPAD */
                <div className="flex-1 p-8 bg-white flex flex-col space-y-6">
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Cash (USD $)</label>
                      <input
                        type="number"
                        value={cashReceivedUSD}
                        onChange={(e) => { setCashReceivedUSD(e.target.value); setActiveInput("USD"); }}
                        onFocus={() => setActiveInput("USD")}
                        className={`block w-full p-4 border-2 rounded-2xl text-2xl font-bold ${activeInput === "USD" ? "border-amber-500 bg-amber-50/30" : "border-gray-200"}`}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Cash (KHR ៛)</label>
                      <input
                        type="number"
                        value={cashReceivedKHR}
                        onChange={(e) => { setCashReceivedKHR(e.target.value); setActiveInput("KHR"); }}
                        onFocus={() => setActiveInput("KHR")}
                        className={`block w-full p-4 border-2 rounded-2xl text-2xl font-bold text-right ${activeInput === "KHR" ? "border-amber-500 bg-amber-50/30" : "border-gray-200"}`}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Quick Cash */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2">
                      <button onClick={handleExactCash} className="py-2 bg-gray-100 font-bold text-sm rounded-xl">Exact</button>
                      <button onClick={() => handleQuickCashUSD(5)} className="py-2 bg-amber-50 text-amber-700 font-bold text-sm rounded-xl">$5</button>
                      <button onClick={() => handleQuickCashUSD(10)} className="py-2 bg-amber-50 text-amber-700 font-bold text-sm rounded-xl">$10</button>
                      <button onClick={() => handleQuickCashUSD(20)} className="py-2 bg-amber-50 text-amber-700 font-bold text-sm rounded-xl">$20</button>
                    </div>
                  </div>

                  {/* Numpad */}
                  <div className="grid grid-cols-3 gap-3 flex-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button key={num} onClick={() => handleNumpadClick(num.toString())} className="py-4 bg-gray-50 hover:bg-gray-100 rounded-2xl font-bold text-2xl">{num}</button>
                    ))}
                    <button onClick={handleClearInput} className="py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-lg">C</button>
                    <button onClick={() => handleNumpadClick("0")} className="py-4 bg-gray-50 rounded-2xl font-bold text-2xl">0</button>
                    <button onClick={() => handleNumpadClick("backspace")} className="py-4 bg-gray-50 flex items-center justify-center rounded-2xl"><Delete size={28} /></button>
                  </div>
                </div>
              ) : (
                /* KHQR DISPLAY PANEL */
                <div className="flex-1 p-8 bg-white flex flex-col items-center justify-center space-y-4">
                  {isLoadingQR ? (
                    <div className="flex flex-col items-center gap-4">
                      <RefreshCw className="animate-spin text-red-500" size={48} />
                      <span className="text-lg font-semibold text-gray-600">Generating QR Code...</span>
                    </div>
                  ) : qrError ? (
                    <div className="flex flex-col items-center gap-4 text-red-600">
                      <X size={48} />
                      <span className="text-lg font-semibold">{qrError}</span>
                      <button onClick={generateWingKHQR} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold">Try Again</button>
                    </div>
                  ) : qrString ? (
                    <div className="w-full max-w-sm bg-red-600 rounded-3xl p-6 flex flex-col items-center text-white shadow-xl">
                      <div className="flex items-center justify-between w-full mb-4 border-b border-red-500/80 pb-3">
                        <span className="font-extrabold tracking-wider text-xl">KHQR</span>
                        <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold">Bakong</span>
                      </div>

                      <div className="bg-white p-3 rounded-2xl flex items-center justify-center w-60 h-60">
                        <QRCodeSVG value={qrString} size={210} level="H" />
                      </div>

                      <div className="mt-4 text-center space-y-1">
                        <p className="text-xl font-black text-white">${total.toFixed(2)}</p>
                        <p className="text-xs text-red-100 font-medium">Scan to pay with any banking app</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-gray-400">
                      <QrCode size={48} />
                      <span className="text-lg font-semibold">No QR Code Generated</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};