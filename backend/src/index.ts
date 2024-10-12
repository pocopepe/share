import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.text('Hello Cloudflare Workers!'));

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

export default app;
