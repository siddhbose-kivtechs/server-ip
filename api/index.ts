import { Hono } from 'hono';
import { handle } from '@hono/node-server/vercel';

const app = new Hono().basePath('/api');

import jwt from 'jsonwebtoken';

// Middleware to parse and analyze JWT
const jwtcheck = async (c) => {
  try {
    // Extract JWT and ulidSession from the request body
    const body = await c.req.json();
    const token = body.idToken; // Expecting `idToken` as per Server 1's implementation
    const ulidSession = body.ulidSession || 'NA'; // Default to 'NA' if not provided

    if (!token) {
      return c.json({ error: 'JWT token is required' }, 400);
    }

    // Log the received token data (sanitize logs in production)
    console.log("Received JWT:", { ulidSession });

    // Decode JWT without verification to extract header and payload
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded) {
      return c.json({ error: 'Invalid JWT' }, 400);
    }

    // (Optional) Verify the token with a secret if required
    const SECRET = process.env.JWT_SECRET; // Use environment variable for the secret
    let isValid = false;
    try {
      jwt.verify(token, SECRET); // Throws an error if invalid
      isValid = true;
    } catch (verificationError) {
      isValid = false;
    }

    // Log the decoded data and verification status
    console.log("Decoded JWT:", { header: decoded.header, isValid });

    // Construct JWT log object (consider saving this to a database)
    const jwtLog = {
      idToken: token,
      header: decoded.header,
      payload: null, // Don't store the payload for security reasons
      isValid,
      receivedAt: new Date(),
      ulidSession, // Use the value from request or 'NA' if not provided
    };

    // Log the JWT data (sanitize logs in production)
    console.log('JWT Log:', jwtLog);

    // Return received and processed data
    return c.json({
      received: {
        idToken: token,
      },
      processed: {
        header: decoded.header,
        isValid,
      },
      message: 'JWT successfully analyzed',
    });
  } catch (error) {
    // Log the error (sanitize in production)
    console.error("Error processing JWT:", error.message);
    return c.json({ error: 'An error occurred', details: error.message }, 500);
  }
};

export default jwtcheck;




// CORS middleware function
const corsMiddleware = (c, next) => {
  c.res.headers.set('Access-Control-Allow-Origin', '*');
  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    c.res.status = 204; // No Content
    return c.json({});
  }

  return next();
};

app.all('*', jwtcheck);

export default handle(app);
