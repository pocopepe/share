import { Hono } from 'hono';

const app = new Hono();

// CORS Middleware to add the CORS headers globally
app.use('*', (c, next) => {
  c.res.headers.set('Access-Control-Allow-Origin', '*'); // Set this to a specific origin if needed
  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.res.headers.set('Access-Control-Expose-Headers', 'ETag');
  return next();
});

// Handle preflight OPTIONS requests
app.options('*', (c) => {
  c.res.headers.set('Access-Control-Allow-Origin', '*'); // Set this to a specific origin if needed
  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return c.text('', 204); // No content
});


app.get('/', (c) => c.text('Hello Cloudflare Workers!'));

app.post('/upload', async (c) => {
  const bucket = (c.env as { MY_BUCKET: any }).MY_BUCKET;

  if (!bucket) {
    console.error('Bucket is undefined. Check your wrangler.toml for binding.');
    return c.text('Internal server error: Bucket not found.', 500);
  }

  try {
    const body = await c.req.parseBody();
    const metaData = body['file'];

    if (!metaData) {
      console.error('No file metadata found in the request body.');
      return c.text('Bad request: No file metadata provided.', 400);
    }

    const fileContent = 'grr'; 

    await bucket.put(metaData.name, fileContent, {
      httpMetadata: {
        contentType: metaData.type,
      },
    });

    console.log(`File ${metaData.name} uploaded successfully.`);
    return c.text('File uploaded successfully.');
  } catch (error) {
    console.error('Error during file upload:', error);
    return c.text(`Error uploading file: ${error.message}`, 500);
  }
});

app.post('/codeshare/:filename', async (c) => {
  const filename = c.req.param('filename');
  console.log('Received request for filename:', filename);

  const bucket = (c.env as { MY_BUCKET: any }).MY_BUCKET;

  if (!bucket) {
    console.error('Bucket is undefined.');
    return c.text('Internal server error: Bucket not found.', 500);
  }

  try {
    const contentType = c.req.header('Content-Type');
    console.log('Content-Type:', contentType);

    let fileContent = '';
    let fileExtension = '';
    let r2ContentType = '';

    if (contentType === 'application/json') {
      const body = await c.req.json();
      fileContent = body.content || '';
      fileExtension = 'json';
      r2ContentType = 'application/json';
    } else if (contentType === 'text/plain') {
      fileContent = await c.req.text();
      fileExtension = 'txt';
      r2ContentType = 'text/plain';
    } else if (contentType === 'application/javascript') {
      fileContent = await c.req.text();
      fileExtension = 'js';
      r2ContentType = 'application/javascript';
    } else if (contentType === 'text/html') {
      fileContent = await c.req.text();
      fileExtension = 'html';
      r2ContentType = 'text/html';
    } else if (contentType === 'application/x-python') {
      fileContent = await c.req.text();
      fileExtension = 'py';
      r2ContentType = 'application/x-python';
    } else {
      return c.text('Unsupported Content-Type. Please send JSON, plain text, JavaScript, HTML, or Python.', 400);
    }

    const objectKey = `${filename}.${fileExtension}`;
    console.log('Saving content:', fileContent);

    await bucket.put(objectKey, fileContent, {
      httpMetadata: {
        contentType: r2ContentType,
      },
    });

    return c.text(`File ${objectKey} created successfully with content.`);
  } catch (error) {
    console.error('Error creating file:', error);
    return c.text(`Error creating file`, 500);
  }
});

app.post('/cleanup', async (c) => {
  const bucket = (c.env as { MY_BUCKET: any }).MY_BUCKET;

  if (!bucket) {
    console.error('Bucket is undefined.');
    return c.text('Internal server error: Bucket not found.', 500);
  }

  try {
    const objects = await bucket.list(); // Fetch the list of objects in the bucket

    if (!objects || objects.length === 0) {
      return c.text('No objects to delete.', 200);
    }

    // Delete all objects in the bucket
    await Promise.all(objects.map(async (obj: { key: string }) => {
      await bucket.delete(obj.key);
      console.log(`Deleted object: ${obj.key}`);
    }));

    return c.text('Bucket cleared successfully.');
  } catch (error) {
    console.error('Error during cleanup:', error);
    return c.text(`Error during cleanup: ${error.message}`, 500);
  }
});


export default app;
