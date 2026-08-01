const multer = require('multer');
const path = require('path');

// កំណត់ Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // កំណត់ folder ស្តុបរូបភាព (ត្រូវបង្កើត folder 'uploads' ក្នុង project ផង)
  },
  filename: (req, file, cb) => {
    // បង្កើតឈ្មោះរូបភាពការពារកុំឱ្យស្ទួន ( timestamp-filename )
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

// Filter យកតែប្រភេទរូបភាព (JPG, PNG, WEBP)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // ដែនកំណត់ទំហំ max 5MB
});

module.exports = upload;