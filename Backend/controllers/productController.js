const db = require('../config/db.js');
const fs = require('fs');
const path = require('path');

// get products with category
const products_with_category = async (req, res) => {
    try {
        // 1. សរសេរ SQL ដោយមាន SELECT និង Aliases ត្រឹមត្រូវ
        const SQL = `
      SELECT 
        p.id AS product_id,
        p.name AS product_name,
        p.base_price,
        p.image,
        c.id AS category_id,
        c.name AS category_name
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC;
    `;

        const [rows] = await db.query(SQL);

        // 2. ប្រើ .map() ដើម្បីរៀបចំ Format ឱ្យទៅជា Nested Object
        const formattedProducts = rows.map(row => ({
            product_id: row.product_id,
            product_name: row.product_name,
            base_price: row.base_price,
            image: row.image ? `http://localhost:5000/uploads/${row.image}` : null,
            category: {
                id: row.category_id,
                name: row.category_name
            }
        }));

        // 3. Return Response
        return res.status(200).json({
            success: true,
            message: "Products with category fetched successfully",
            products: formattedProducts
        });

    } catch (error) {
        console.error('Error in products_with_category:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch products with category",
            error: error.message
        });
    }
};

// get products
const getproduct = async (req, res) => {
    try {
        const SQL = 'SELECT * FROM products ';
        const [result] = await db.query(SQL);
        const formattedimage = result.map(row => ({
            ...row,
            image: row.image ? `http://localhost:5000/uploads/${row.image}` : null
        }))
        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            products: formattedimage
        })
    } catch (err) {
        console.error('Error in getproduct:', err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: err.message
        });
    }
}

const createproduct = async (req, res) => {
    try {
        // req.body ពេលនេះនឹងមានតម្លៃ ( category_id, name, base_price ) 
        const { category_id, name, base_price } = req.body || {};

        // ទាញយករូបភាពចេញពី req.file
        const image = req.file ? req.file.filename : null;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Please provide product name"
            });
        }

        const SQL = "INSERT INTO products (name, base_price, category_id, image) VALUES (?, ?, ?, ?)";
        const params = [name, base_price, category_id, image];

        const [result] = await db.query(SQL, params);

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: {
                id: result.insertId,
                name,
                base_price,
                category_id,
                image
            }
        });

    } catch (err) {
        console.error('Error in createproduct:', err);
        return res.status(500).json({
            success: false,
            message: "Failed to create product",
            error: err.message
        });
    }
};

// remove product
const removeproduct = async (req, res) => {
    try {
        const { id } = req.params;// 1. SELECT ទាញយករូបភាពចេញពី Database ជាមុនសិន (ដើម្បីស្គាល់ឈ្មោះ File)
    const selectSql = 'SELECT image FROM products WHERE id = ?';
    const [rows] = await db.query(selectSql, [id]);

    // បើរកមិនឃើញ Product ត្រូវ Return 404
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    const imageName = rows[0].image;
    // 2. DELETE លុបទិន្នន័យចេញពី MySQL
    const deleteSql = 'DELETE FROM products WHERE id = ?';
    const [result] = await db.query(deleteSql, [id]);

    // 3. ប្រសិនបើមានឈ្មោះរូបភាព ត្រូវលុប File នោះចេញពី Folder uploads/
    if (imageName) {
      const imagePath = path.join(__dirname, '../uploads', imageName); // ត្រូវតម្រឹម Path ទៅ Folder uploads ឱ្យត្រូវ

      // ឆែកមើលថាតើ File នោះពិតជាមានក្នុង Folder ឬអត់ មុននឹងលុប
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Failed to delete image file:', err);
          } else {
            console.log(`Successfully deleted image: ${imageName}`);
          }
        });
      }
    }
        return res.status(200).json({
            success: true,
            message: "Product remove successfully",
            products: result
        })
    } catch (err) {
        console.error('Error in removeproduct:', err);
        return res.status(500).json({
            success: false,
            message: "Failed to remove product",
            error: err.message
        });
    }
}

// update products 
const updateproduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, base_price, category_id } = req.body || {};

    // 1. SELECT រកមើល Product និងរូបភាពចាស់ក្នុង Database
    const selectSql = "SELECT image FROM products WHERE id = ?";
    const [rows] = await db.query(selectSql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    const oldImage = rows[0].image; // ឈ្មោះរូបភាពចាស់
    let newImage = oldImage;        // កំណត់ default ប្រើរូបចាស់

    // 2. ប្រសិនបើមាន Upload រូបភាពថ្មីមក (req.file)
    if (req.file) {
      newImage = req.file.filename; // យកឈ្មោះរូបភាពថ្មី

      // លុបរូបភាពចាស់ចេញពី Folder uploads/
      if (oldImage) {
        // ប្រើ process.cwd() ដើម្បីចង្អុលទៅ Root Project Folder ឱ្យចំ 100%
        const oldImagePath = path.join(process.cwd(), 'uploads', oldImage);

        // ឆែកមើលផ្លូវ File ក្នុង Console
        console.log("Attempting to delete old image at:", oldImagePath);

        if (fs.existsSync(oldImagePath)) {
          try {
            // ប្រើ fs.promises.unlink ជាមួយ await
            await fs.promises.unlink(oldImagePath);
            console.log(` Successfully deleted old image: ${oldImage}`);
          } catch (unlinkErr) {
            console.error(' Error deleting old image file:', unlinkErr.message);
          }
        } else {
          console.warn(` File not found at path: ${oldImagePath}`);
        }
      }
    }
    // 3. UPDATE ទិន្នន័យចូលក្នុង MySQL
    const SQL = "UPDATE products SET name = ?, base_price = ?, category_id = ?, image = ? WHERE id = ?";
    const params = [name, base_price, category_id, newImage, id];

    const [result] = await db.query(SQL, params);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: {
        id,
        name,
        base_price,
        category_id,
        image: newImage
      }
    });

  } catch (err) {
    console.error('Error in updateproduct:', err);
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: err.message
    });
  }
};

module.exports = {
    products_with_category,
    getproduct,
    removeproduct,
    updateproduct,
    createproduct

}