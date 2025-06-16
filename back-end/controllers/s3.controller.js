const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const dotenv = require('dotenv');
dotenv.config();

const s3 = new S3Client({
  region: 'us-east-1', // B2 uses us-east-1 for all buckets
  endpoint: process.env.B2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.B2_ACCESS_KEY,
    secretAccessKey: process.env.B2_SECRET_KEY
  },
  forcePathStyle: true
});

console.log("B2_BUCKET:", process.env.B2_BUCKET);

const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.B2_BUCKET,
      Key: 'cms/complaints/'+file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype
    });

    await s3.send(uploadCommand);
    res.status(200).json({ message: 'File uploaded successfully', key: file.originalname });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'File upload failed' });
  }
};

const getSignedUrlHandler = async (req, res) => {
  try {
    const { key } = 'cms/complaints/'+req.query;
    const command = new GetObjectCommand({
      Bucket: process.env.B2_BUCKET,
      Key: key
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    res.status(200).json({ url });
  } catch (err) {
    console.error('Signed URL error:', err);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
};

module.exports = {
  uploadFile,
  getSignedUrlHandler
};