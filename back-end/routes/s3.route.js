const express = require('express');
const multer = require('multer');
const { uploadFile, getSignedUrlHandler } = require('../controllers/s3.controller');

const router = express.Router();
const upload = multer(); // uses memory storage

router.post('/upload', upload.single('file'), uploadFile);
router.get('/signed-url', getSignedUrlHandler);

module.exports = router;
