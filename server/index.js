const express = require('express');
const cors = require('cors');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

require('dotenv').config({ path: './.env' });
console.log(`TABLE:${process.env.AWS_DYNAMODB_TABLE_NAME}`);

const app = express();
const PORT = 5000;

app.use(cors());
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

// Route 1: Generate S3 Link (Uses Backticks for the Key)
app.get('/api/upload-url', async (req, res) => {
  const { fileName, fileType } = req.query;
  // Use backticks here!
  const s3Key = `uploads/${Date.now()}_${fileName}`; 

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: s3Key,
    ContentType: fileType,
  });

  try {
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });
    // Return both the URL and the Key
    res.json({ uploadUrl: url, s3Key: s3Key }); 
  } catch (err) {
    res.status(500).json({ error: "Failed to generate link" });
  }
});

// Route 2: Register in DynamoDB (Uses Backticks for the URL)
app.post('/api/confirm-upload', async (req, res) => {
  const { fileName, fileType, s3Key } = req.body; 

  // Use backticks here!
  const permanentUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

  const command = new PutCommand({
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Item: {
      id: s3Key, 
      fileName: fileName,
      fileType: fileType,
      s3Url: permanentUrl,
      aiTags:[],
      createdAt: new Date().toISOString()
    }
  });

  try {
    await docClient.send(command);
    res.status(201).json({ success: true, message: "Metadata saved!" });
  } catch (err) {
  console.error("========== DDB ERROR ==========");
  console.error(err);
  console.error("MESSAGE:", err.message);
  console.error("NAME:", err.name);
  console.error("STACK:", err.stack);
  console.error("FULL:", JSON.stringify(err, null, 2));

  res.status(500).json({
    error: err.message
  });
}
  }
);

app.get('/api/gallery',async (req,res)=>{
    const command = new ScanCommand({
      TableName:process.env.AWS_DYNAMODB_TABLE_NAME
    })

    try{
      const response=await docClient.send(command);
      res.json(response.Items)
    }
    catch(err){
      console.error("Gallery Fetch Error:", err);
    res.status(500).json({ error: "Failed to retrieve gallery items" });
    }

})

app.get('/',()=>{
  console.log('working')
})
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));