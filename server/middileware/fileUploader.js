const multer = require('multer');
// Set up the storage destination and filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'file-uploads')
  },
  filename: function (req, file, cb) {
    var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
    // cb(null,Date.now()+path.extname(file.originalname));
    cb(null, file.originalname + '-' + Date.now() + ext);
  },
});

// Create the Multer instance with the specified storage configuration
const upload = multer({
  storage: storage
});


module.exports = upload;