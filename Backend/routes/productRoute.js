const {
    products_with_category
    , createproduct, 
    removeproduct
    , updateproduct,
    getproduct
} = require('../controllers/productController.js');

const upload = require('../middleware/upload');
const products = (app) => {
    app.get('/products_with_category', products_with_category);
    app.get('/all_products', getproduct)
    app.post('/create_product', upload.single('image'), createproduct);
    app.delete('/remove_product/:id', removeproduct);
    app.post('/update_product/:id', upload.single('image'), updateproduct);
}
module.exports = products;