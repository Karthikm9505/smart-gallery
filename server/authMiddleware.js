const { CognitoJwtVerifier } = require("aws-jwt-verify");
require('dotenv').config();

// Create the verifier pointing to your specific User Pool
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID,
});

const requireAuth = async (req, res, next) => {
  try {
    // 1. Grab the "VIP Wristband" from the request headers
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1]; // Format: "Bearer <token>"

    if (!token) {
      return res.status(401).json({ error: "Access Denied: No token provided" });
    }

    // 2. Mathematically verify the token with AWS
    const payload = await verifier.verify(token);

    // 3. Attach the user's secure AWS ID to the request
    req.user = { id: payload.sub }; 
    
    // 4. Let them pass to the route
    next(); 
  } catch (err) {
    console.error("Token verification failed!", err);
    return res.status(403).json({ error: "Access Denied: Invalid or expired token" });
  }
};

module.exports = requireAuth;