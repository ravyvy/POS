require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// khqr

const khqrcode = require('./routes/generate-qr.js');
khqrcode(app);
// បើក folder 'uploads' ឱ្យទៅជា Static Resource
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// category route
const CategoryRoute = require('./routes/categoryRoute.js');
CategoryRoute(app);

// option route
const OptionRoute = require('./routes/optionRoute.js');
OptionRoute(app);

// product route
const ProductRoute = require('./routes/productRoute.js');
ProductRoute(app);
// order route 
const OrderRoute = require('./routes/orderRoute.js');
OrderRoute(app);
app.get('/', (req, res) => {
  res.json({ message: 'Hello World from Express!' });
}); 

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});