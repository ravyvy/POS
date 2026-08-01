// 📄 Path: backend/routes/payment.js
const { tlv } = require("./tlv");   // ពិនិត្យ Relative Path ឱ្យត្រូវជាមួយ tlv.js
const { crc16 } = require("./crc16"); // ពិនិត្យ Relative Path ឱ្យត្រូវជាមួយ crc16.js

const MERCHANT = {
  guid: "khqr@aclb",
  accountId: "85518164163",
  bankName: "ACLEDA",
  merchantCategoryCode: "5999",
  countryCode: "KH",
  merchantName: process.env.MERCHANT_NAME || "OL RAVY",
  merchantCity: "Phnom Penh",
  mobileNumber: "0964925323",
  tag39Extra: tlv("00", "2CCY") + tlv("01", "4"),
};

const CURRENCY = { KHR: "116", USD: "840" };

function buildKHQR(amount, currency = "USD") {
  const currencyCode = CURRENCY[currency];
  if (!currencyCode) throw new Error("Unsupported currency: " + currency);

  const amountStr =
    currency === "USD" ? Number(amount).toFixed(2) : String(Math.round(amount));

  const tag29 =
    tlv("00", MERCHANT.guid) +
    tlv("01", MERCHANT.accountId) +
    tlv("02", MERCHANT.bankName);

  const tag62 = tlv("02", MERCHANT.mobileNumber);

  const fieldsBeforeCRC =
    tlv("00", "01") +
    tlv("01", "12") +
    tlv("29", tag29) +
    tlv("39", MERCHANT.tag39Extra) +
    tlv("52", MERCHANT.merchantCategoryCode) +
    tlv("58", MERCHANT.countryCode) +
    tlv("53", currencyCode) +
    tlv("54", amountStr) +
    tlv("59", MERCHANT.merchantName) +
    tlv("60", MERCHANT.merchantCity) +
    tlv("62", tag62);

  const withCrcTagHeader = fieldsBeforeCRC + "6304";
  const crc = crc16(withCrcTagHeader);

  return withCrcTagHeader + crc;
}

module.exports = function (app) {
  // 🟢 Endpoint 1: បង្កើត QR String
  app.post("/api/generate-qr", async (req, res) => {
    try {
      const { amount, currency = "USD" } = req.body;
      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({ success: false, message: "Invalid amount" });
      }
      const qr = buildKHQR(Number(amount), currency);
      return res.json({ success: true, qr });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // 🟢 Endpoint 2: ឆែក Status បង់ប្រាក់
  app.post("/api/check-status/:md5", async (req, res) => {
    try {
      // 💡 ទីនេះជាកន្លែងដាក់ Logic ឆែកមើល Transaction ACLEDA/Bakong
      const isPaid = false; // ដូរទៅជា Logic ឆែកជាក់ស្តែង
      
      return res.json({ 
        success: true, 
        status: isPaid ? "PAID" : "PENDING" 
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });
};