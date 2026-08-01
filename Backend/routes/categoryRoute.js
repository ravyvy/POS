const { 
    getcategorywithproducts , 
    getcategory,
    CreateCategory , 
    removeCategory , 
    updateCategory} = require('../controllers/categoryController.js');

const categorys = (app) => {
    app.get('/category_with_products', getcategorywithproducts);
    app.get('/all_category', getcategory);
    app.post('/create_category',  CreateCategory);
    app.delete('/remove_category/:id', removeCategory);
    app.post('/update_category/:id', updateCategory);
}
module.exports = categorys;  