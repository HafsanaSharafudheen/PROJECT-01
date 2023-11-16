const express = require('express');
const router = express.Router();

// Define a route to serve a specific uploaded file
router.get('/files/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(filename, { root: 'file-uploads' });
});

module.exports = router;
