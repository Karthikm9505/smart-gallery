const express = require('express');
const cors = require('cors');
const { S3Client, PutObjectCommand,GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb"); // We swapped Scan for Query!

require('dotenv').config();

// 1. IMPORT THE BOUNCER
const requireAuth = require('./authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
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

// Route 1: Get S3 Link (SECURED)
app.get('/api/upload-url', requireAuth, async (req, res) => {
  const { fileName, fileType } = req.query;
  
  // 2. LOGICAL S3 PARTITIONING (Inject the userId into the folder path)
  const s3Key = `uploads/${req.user.id}/${Date.now()}_${fileName}`; 

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

// Route 2: Save Metadata (SECURED)
app.post('/api/confirm-upload', requireAuth, async (req, res) => {
  const { fileName, fileType, s3Key } = req.body; 
  const permanentUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

  // 3. MULTI-TENANT DATABASE ITEM
  const command = new PutCommand({
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME, 
    Item: {
      userId: req.user.id,                    // Partition Key (Strictly isolates data)
      createdAt: new Date().toISOString(),    // Sort Key (For chronological ordering)
      id: s3Key, 
      fileName: fileName,
      fileType: fileType,
      s3Url: permanentUrl,
      aiTags: []
    }
  });

  try {
    await docClient.send(command);
    res.status(201).json({ success: true, message: "Metadata saved!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route 3: Fetch User Gallery (SECURED)
app.get('/api/gallery', requireAuth, async (req, res) => {
  
  // 4. THE QUERY COMMAND (No more scanning!)
  const command = new QueryCommand({
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: {
      ":uid": req.user.id
    },
    ScanIndexForward: false // Retrieves the newest photos first
  });

  try {
    const response = await docClient.send(command);
    res.json(response.Items);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve gallery items" });
  }
});
// image download
app.get("/api/download-url", async (req, res) => {
  try {
    const key = req.query.key;

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,

      ResponseContentDisposition: 'attachment',
    });

    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: 60,
    });

    res.json({ url: signedUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate download URL" });
  }
});

// delete image
app.delete('/api/delete-image', requireAuth, async (req, res) => {
  try {
    const { s3Key, createdAt } = req.body;

    // 1. Delete from S3
    const deleteS3Command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    });

    await s3.send(deleteS3Command);

    // 2. Delete from DynamoDB
    const deleteDbCommand = new DeleteCommand({
      TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
      Key: {
        userId: req.user.id,
        createdAt: createdAt
      }
    });

    await docClient.send(deleteDbCommand);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to delete image'
    });
  }
});

app.get('/health', (req, res) => res.send('Secure API is running...'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));