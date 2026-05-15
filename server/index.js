const express = require('express');
const cors = require('cors');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000; // Render will provide a dynamic port

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

// UPDATED: Restrictive CORS for production
app.use(cors({
  origin(origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT'],
  credentials: true,
}));

app.use(express.json());

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const docClient = DynamoDBDocumentClient.from(ddbClient);

app.get('/api/upload-url', async (req, res) => {
  const { fileName, fileType } = req.query;
  const s3Key = `uploads/${Date.now()}_${fileName}`; 

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: s3Key,
    ContentType: fileType,
  });

  try {
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });
    res.json({ uploadUrl: url, s3Key: s3Key }); 
  } catch (err) {
    res.status(500).json({ error: "Failed to generate link" });
  }
});

app.post('/api/confirm-upload', async (req, res) => {
  const { fileName, fileType, s3Key } = req.body; 
  const permanentUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

  const command = new PutCommand({
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Item: {
      id: s3Key, 
      fileName: fileName,
      fileType: fileType,
      s3Url: permanentUrl,
      aiTags: [],
      createdAt: new Date().toISOString()
    }
  });

  try {
    await docClient.send(command);
    res.status(201).json({ success: true, message: "Metadata saved!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/gallery', async (req, res) => {
  const command = new ScanCommand({
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME
  });

  try {
    const response = await docClient.send(command);
    res.json(response.Items);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve gallery items" });
  }
});

app.get('/health', (req, res) => res.send('API is running...'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));