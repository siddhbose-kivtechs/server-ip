import { Hono } from 'hono';
import { handle } from '@hono/node-server/vercel';
import jwt from 'jsonwebtoken';

const app = new Hono().basePath('/api');

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

// Middleware to parse and analyze JWT
const jwtcheck = async (c, next) => {
  try {
    // Extract JWT and ulidSession from the request body
    const body = await c.req.json();
    const token = body?.idToken; // Expecting `idToken` as per Server 1's implementation
    const ulidSession = body?.ulidSession || 'NA'; // Default to 'NA' if not provided

    if (!token) {
      return c.json({ error: 'JWT token is required' }, 400);
    }

    // Decode JWT without verification to extract header and payload
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded) {
      return c.json({ error: 'Invalid JWT' }, 400);
    }

    // Verify the token with a secret if required
    const SECRET = process.env.JWT_SECRET; // Ensure you have JWT_SECRET set in your environment variables
    let isValid = false;
    try {
      jwt.verify(token, SECRET); // Throws an error if invalid
      isValid = true;
    } catch (verificationError) {
      isValid = false;
    }

    // Log the decoded data and verification status
    console.log("Decoded JWT:", { header: decoded.header, isValid });

    // Construct JWT log object (consider saving this to a database if required)
    const jwtLog = {
      idToken: token,
      header: decoded.header,
      payload: null, // Avoid storing sensitive data for security reasons
      isValid,
      receivedAt: new Date(),
      ulidSession, // Use the value from request or 'NA' if not provided
    };

    console.log('JWT Log:', jwtLog);

    // Attach the verification result to the context for further processing
    c.set('jwtInfo', {
      header: decoded.header,
      isValid,
    });

    return next();
  } catch (error) {
    console.error("Error processing JWT:", error.message);
    return c.json({ error: 'An error occurred', details: error.message }, 500);
  }
};

// Apply CORS middleware globally
app.use('*', corsMiddleware);

// Apply JWT middleware to specific routes
app.post('/payload', jwtcheck, (c) => {
  const jwtInfo = c.get('jwtInfo'); // Retrieved from the context set in jwtcheck
  return c.json({
    message: 'JWT successfully verified',
    jwtInfo,
  });
});

// Fallback route
app.all('*', (c) => {
  return c.json({ message: 'Server running OK' });
});

// Export the app handler for Vercel
export default handle(app);
