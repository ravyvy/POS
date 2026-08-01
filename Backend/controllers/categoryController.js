const db = require('../config/db.js');

// Get all data category
const getcategorywithproducts = async (req, res) => {
  try {
    // 1. Fetch ទិន្នន័យ JOIN រវាង categories និង products
    const SQL = `
      SELECT 
        c.id AS category_id,
        c.name AS category_name,
        p.id AS product_id,
        p.name AS product_name,
        p.base_price,
        p.image
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      ORDER BY c.id ASC, p.id DESC
    `;

    const [rows] = await db.query(SQL);

    // 2. រៀបចំ Grouping ទិន្នន័យឱ្យទៅជា Nested JSON
    const groupedCategories = rows.reduce((acc, row) => {
      // ឆែកមើលថា Category នេះមានក្នុង Array ស្ដុក (acc) ហើយឬនៅ?
      let category = acc.find(c => c.category_id === row.category_id);
      // បើមិនទាន់មាន បង្កើត Category Object ថ្មី
      if (!category) {
        category = {
          category_id: row.category_id,
          category_name: row.category_name,
          products: [] //បង្កើត Array ទទេសម្រាប់ចាំទទួល Product
        };
        acc.push(category); // រុញ Category ថ្មីនេះចូលទៅក្នុងកន្ត្រកធំ acc
      }
      // បើមាន Product ភ្ជាប់ជាមួយ Category នេះ ថែមវាចូលក្នុង Array 'products'
      if (row.product_id) {
        category.products.push({
          id: row.product_id,
          product_name: row.product_name,
          base_price: row.base_price,
          image: row.image ? `http://localhost:5000/uploads/${row.image}` : null
        });
      }
      return acc;
    }, []);

    // 3. Return API Response
    return res.status(200).json({
      success: true,
      categories: groupedCategories
    });

  } catch (error) {
    console.error('Error fetching categories with products:', error);
    return res.status(500).json({
      success: false,
      message: "Error fetching categories with products",
      error: error.message
    });
  }
};

// get category 
const getcategory = async (req, res) => {
  try {
    const sql = "SELECT * FROM categories";
    // 2. ប្រើ await ដោយគ្មាន callback function
    const [rows] = await db.query(sql);
    // 3. Return response នៅពេលរត់ជោគជ័យ
    return res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      categories: rows // កែអក្ខរាវិរុទ្ធពី categorys ទៅ categories
    });

  } catch (err) {
    // 4. រាល់ SQL/Server Error ទាំងអស់នឹងលោតមកទីនេះ
    console.error('Error fetching categories:', err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};
// Create dara category
const CreateCategory = async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Please provide category name"
      })
    }
    const sql = "INSERT INTO categories (name) VALUES (?)";
    const params = [name];
    const [result] = await db.query(sql, params);
    return res.status(200).json({
      success: true,
      message: "Category created successfully",
      categorys: result
    })

  } catch (error) {
    console.error('Error in CreateCategory:', error);
    // Catch រាល់ Error ទាំងអស់ រួមទាំង SQL Error ផងដែរ
    return res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message
    });
  }
}

// remove category
const removeCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "DELETE FROM categories WHERE id = ? ";
    const params = [id];
    const [result] = await db.query(sql, params);
    return res.status(200).json({
      success: true,
      message: "Category remove successfully",
      categorys: result
    })
  } catch (err) {
    console.error('Error in removeCategory:', err);
    // Catch រាល់ Error ទាំងអស់ រួមទាំង SQL Error ផងដែរ
    return res.status(500).json({
      success: false,
      message: "Error removing category",
      error: err.message
    });
  }
}

// update category 
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body || {};
    if (!name) {
      return res.json({
        message: "Please provide name",
        success: false
      })
    }
    const sql = "UPDATE categories SET name =? WHERE id = ?";
    const params = [name, id];
    const [result] = await db.query(sql, params);
    return res.status(200).json({
      success: true,
      message: "Category update successfully",
      categorys: result.affectedRows
    })
  }
  catch (err) {
    console.error('Error in updateCategory:', error);
    // Catch រាល់ Error ទាំងអស់ រួមទាំង SQL Error ផងដែរ
    return res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message
    });
  }
}
module.exports = {
  getcategorywithproducts,
  getcategory,
  CreateCategory,
  removeCategory,
  updateCategory
};