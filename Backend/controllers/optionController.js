const db = require('../config/db.js');

const optionproduct  = async (req , res) => {
    try{
    const { product_id } = req.params;
      const sql = `
      SELECT 
        po.product_id,
        o.id AS option_id,
        o.name AS option_name,
        o.is_required,
        ov.id AS option_value_id,
        ov.name AS option_value_name,
        ov.extra_price
      FROM product_options po
      JOIN options o ON po.option_id = o.id
      JOIN option_values ov ON o.id = ov.option_id
      WHERE po.product_id = ?;
    `;
       const params = [product_id]
       const [rows] = await db.query(sql , params );
       const formattedOptions = rows.reduce((acc , row) => {
        // check if option already exists
            const option = acc.find(opt => opt.option_id === row.option_id)
            if(!option){
                acc.push({
                    option_id: row.option_id,
                    option_name: row.option_name,
                    is_required: row.is_required,
                    option_values: [{
                        option_value_id: row.option_value_id,
                        option_value_name: row.option_value_name,
                        extra_price: row.extra_price
                    }]
                })
            }else {
                option.option_values.push({
                    option_value_id: row.option_value_id,
                    option_value_name: row.option_value_name,
                    extra_price: row.extra_price
                })
            }
            return acc
       },[])
       return res.status(200).json({
        success: true,
        message: "Product options fetched successfully",
        product_options: formattedOptions
       })
    }catch(err){
        console.error('Error in optionproduct:', err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch product options",
            error: err.message
        });
    }
}

// ========================================
// product option
// ========================================
// create products_option
const create_product_option = async (req , res) => {
    try{
        const { product_id , option_id } = req.body;
        const sql = `
        INSERT INTO product_options (product_id, option_id)
        VALUES (?, ?);
      `;
      const params = [product_id, option_id];
      const [rows] = await db.query(sql, params);
      return res.status(200).json({  
       success: true,
       message: "Option created successfully",
       options: rows 
      })
    }catch(err){
        console.error('Error in createoptions:', err);
        return res.status(500).json({
            success: false,
            message: "Failed to create option",
            error: err.message
        });
    }
}
// remove product option
const remove_product_option = async (req , res) => {
   try{
   const { product_option_id} = req.params;
   const SQL = `
   DELETE FROM product_options WHERE id = ?;
   `;
   const params = [ product_option_id] ;
   const [result]= await db.query(SQL , params);
   if(result.affectedRows == 0) {
    return res.status(404).json({
        success: false,
        message: "Product option not found",
        error: err.message
    })
   }
   return res.status(200).json({
    success: true,
    message: "Product option removed successfully",
    options: result
   })
      
   }catch(e){
      return res.status(500).json({
        success: false,
        message: "Failed to remove product option",
        error: e.message
      })
   }
}
// update product option
const update_product_option = async (req , res) => {
    try{
    const { product_option_id} = req.params;
    const { product_id , option_id } = req.body;
    const SQL = `
    UPDATE product_options SET product_id = ?, option_id = ? WHERE id = ?;
    `;
    const params = [ product_id , option_id, product_option_id] ;
    const [result]= await db.query(SQL , params);
    if(result.affectedRows == 0) {
        return res.status(404).json({
            success: false,
            message: "Product option not found",
            error: err.message
        })
    }
    return res.status(200).json({
        success: true,
        message: "Product option updated successfully",
        options: result
    })
      
    }catch(e){
        return res.status(500).json({
            success: false,
            message: "Failed to update product option",
            error: e.message
        })
    }
}

// ========================================
// option value
// ========================================
// create option value
const create_option_value = async (req , res) => {
    try{
    const { option_id, name, extra_price } = req.body;
    const sql = `
    INSERT INTO option_values (option_id, name, extra_price)
    VALUES (?, ?, ?);
  `;
  const params = [option_id, name, extra_price];
  const [rows] = await db.query(sql, params);
  return res.status(200).json({
    success: true,
    message: "Option value created successfully",
    option_values: rows
  })
}catch(e){
    return res.status(500).json({
        success: false,
        message: "Failed to create option value",
        error: e.message
    })
}
}   
// remove option value
const remove_option_value = async (req , res) => {
    try{
    const { option_value_id} = req.params;
    const SQL = `
    DELETE FROM option_values WHERE id = ?;
    `;
    const params = [ option_value_id] ;
    const [result]= await db.query(SQL , params);
    if(result.affectedRows == 0) {
        return res.status(404).json({
            success: false,
            message: "Option value not found",
            error: err.message
        })
    }
    return res.status(200).json({
        success: true,
        message: "Option value removed successfully",
        option_values: result
    })
      
    }catch(e){
        return res.status(500).json({
            success: false,
            message: "Failed to remove option value",
            error: e.message
        })
    }
}
// update option value
const update_option_value = async (req , res) => {
    try{
    const { option_value_id} = req.params;
    const { name, extra_price } = req.body;
    const SQL = `
    UPDATE option_values SET name = ?, extra_price = ? WHERE id = ?;
    `;
    const params = [ name, extra_price, option_value_id] ;
    const [result]= await db.query(SQL , params);
    if(result.affectedRows == 0) {
        return res.status(404).json({
            success: false,
            message: "Option value not found",
            error: err.message
        })
    }
    return res.status(200).json({
        success: true,
        message: "Option value updated successfully",
        option_values: result
    })
      
    }catch(e){
        return res.status(500).json({
            success: false,
            message: "Failed to update option value",
            error: e.message
        })
    }
}


// ========================================
// option  
// ========================================
// create option  
const create_option = async (req , res) => {
    try{
    const { name, is_required } = req.body;
    const sql = `
    INSERT INTO options (name, is_required)
    VALUES (?, ?);
  `;
  const params = [name, is_required];
  const [rows] = await db.query(sql, params);
  return res.status(200).json({  
   success: true,
   message: "Option created successfully",
   options: rows 
  })
}catch(e){
    return res.status(500).json({
        success: false,
        message: "Failed to create option",
        error: e.message
    })
}
}
// remove option
const remove_option = async (req , res) => {
    try{
    const { option_id} = req.params;
    const SQL = `
    DELETE FROM options WHERE id = ?;
    `;
    const params = [ option_id] ;
    const [result]= await db.query(SQL , params);
    if(result.affectedRows == 0) {
        return res.status(404).json({
            success: false,
            message: "Option not found",
            error: err.message
        })
    }
    return res.status(200).json({
        success: true,
        message: "Option removed successfully",
        options: result
    })
      
    }catch(e){
        return res.status(500).json({
            success: false,
            message: "Failed to remove option",
            error: e.message
        })
    }
}
// update option
const update_option = async (req , res) => {
    try{
    const { option_id} = req.params;
    const { name, is_required } = req.body;
    const SQL = `
    UPDATE options SET name = ?, is_required = ? WHERE id = ?;
    `;
    const params = [ name, is_required, option_id] ;
    const [result]= await db.query(SQL , params);
    if(result.affectedRows == 0) {
        return res.status(404).json({
            success: false,
            message: "Option not found",
            error: err.message
        })
    }
    return res.status(200).json({
        success: true,
        message: "Option updated successfully",
        options: result
    })
      
    }catch(e){
        return res.status(500).json({
            success: false,
            message: "Failed to update option",
            error: e.message
        })
    }
}


module.exports = {
    // product option
    optionproduct, 
    create_product_option,
    remove_product_option,
    update_product_option,
    // option value
    create_option_value,
    remove_option_value,
    update_option_value,
    // option
    create_option,
    remove_option,
    update_option
}
