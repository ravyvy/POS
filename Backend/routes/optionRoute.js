const {
     optionproduct    
    , create_product_option
    , remove_product_option
    , update_product_option
    , create_option_value
    , remove_option_value
    , update_option_value
    , create_option
    , remove_option
    , update_option 
    
} = require('../controllers/optionController');

const options = (app) => {
    app.get('/option_product/:product_id', optionproduct)

    // option value
    app.post('/create_option_value', create_option_value)
    app.delete('/remove_option_value/:option_value_id', remove_option_value)
    app.post('/update_option_value/:option_value_id', update_option_value)

    // option
    app.post('/create_option', create_option)
    app.delete('/remove_option/:option_id', remove_option)
    app.post('/update_option/:option_id', update_option)

    // product option
    app.post('/create_product_option', create_product_option)
    app.delete('/remove_product_option/:product_option_id', remove_product_option)
    app.post('/update_product_option/:product_option_id', update_product_option)
}
module.exports = options