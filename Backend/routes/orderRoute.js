const { getallOrder, createOrder } = require('../controllers/orderController');

const order = (app) => {
    app.post('/create_order', createOrder);
    app.get('/order', getallOrder);
}

module.exports = order;