const db = require('../config/db.js');

// មុខងារបង្កើតលេខ Order ដោយស្វ័យប្រវត្តិ (ឧទាហរណ៍: ORD-1690000000)
function generateOrderNo() {
  return 'ORD-' + Date.now().toString().slice(-8);
}

async function createOrder(orderData) {
  let conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const orderNo = generateOrderNo();

    const [orderResult] = await conn.execute(
      `INSERT INTO orders (
        order_no, user_id, subtotal, discount, tax, 
        total_amount, paid_amount, change_amount, payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNo,
        orderData.user_id,
        orderData.subtotal,
        orderData.discount,
        orderData.tax,
        orderData.total_amount,
        orderData.paid_amount,
        orderData.change_amount,
        orderData.payment_method
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of orderData.cart) {
      const itemSubtotal = item.price * item.quantity;

      await conn.execute(
        `INSERT INTO order_items (
          order_id, product_id, product_name, unit_price, quantity, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.product_name,
          item.price,
          item.quantity,
          itemSubtotal
        ]
      );
    }

    await conn.commit();
    return { success: true, orderId, orderNo };

  } catch (error) {
    await conn.rollback();
    console.error("Error creating order:", error);
    throw error;
  } finally {
    conn.release();
  }
}

// getorder
const getallOrder = async (req, res) => {
    try {
        const  SQL = 'SELECT FROM orders';
        const order = await db.raw(SQL);
    } catch (error) {
        console.error("Error getting order:", error);
        res.status(500).json({ error: "Failed to get order" });
    }
};

module.exports = {
    createOrder,
    getallOrder
};