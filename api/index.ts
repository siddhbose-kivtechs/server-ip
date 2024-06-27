import { Hono } from 'hono';
import { handle, Status } from '@hono/node-server/vercel';
import { prettyJSON } from 'hono/pretty-json';

const app = new Hono().basePath('/api');

app.use(prettyJSON({ space: 4 }));

app.get('/', (c) => {
  // Retrieve IP address and user-agent
  const userAgent = c.req.headers.get('user-agent'); // Access user-agent header

  // Prepare response data
  const response = {
    message: 'IP services Working CoolieWale',
    IP: c.ip || c.req.headers.get('x-real-ip') || c.req.headers.get('x-forwarded-for') || c.req.headers.get('x-vercel-forwarded-for'),
    VERCEL_latitude: c.req.headers.get('x-vercel-ip-latitude'),
    VERCEL_longitude: c.req.headers.get('x-vercel-ip-longitude'),
    VERCEL_city: c.req.headers.get('x-vercel-ip-city'),
    VERCEL_region: c.req.headers.get('x-vercel-ip-country-region'),
    VERCEL_country: c.req.headers.get('x-vercel-ip-country'),
    UA: userAgent,
    date_time: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  };

  // Use c.json to send the data as JSON with a specific status code (200 OK by default)
  return c.json(response, { status: Status.OK });
});

app.post('/', async (c) => {
  try {
    const input = await c.req.json();
    // Process input data

    // Return response with a specific status code (200 OK by default)
    return c.json(input, { status: Status.OK });
  } catch (error) {
    // Handle errors and return appropriate status code (e.g., 400 Bad Request for validation errors)
    return c.json({ error: 'Invalid input' }, { status: Status.BadRequest });
  }
});

export default handle(app);
