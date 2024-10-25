import { Hono } from 'hono';

const app = new Hono();

app.use('*', (c, next) => {
  c.res.headers.set('Access-Control-Allow-Origin', '*');
  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.res.headers.set('Access-Control-Expose-Headers', 'ETag');
  return next();
});

app.options('*', (c) => {
  c.res.headers.set('Access-Control-Allow-Origin', '*');
  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return c.text('', 204);
});

app.get('/', (c) => c.text('Hello Cloudflare Workers!'));


app.get('/hash', (c)=>{
  const password = c.req.header('password'); 
  if (!password) {
    return c.text('Password header not provided', 400); 
  }
  
  return c.text(`Received password: ${password}`);

})

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


app.get('/get/codeshare/:filename', async (c) => { 
  const bucket = (c.env as { MY_BUCKET: any }).MY_BUCKET;
  const requestedFilename = c.req.param('filename'); 

  console.log('Requested filename:', requestedFilename); 

  if (!bucket) {
    console.error('Bucket is undefined.');
    return c.text('Internal server error: Bucket not found.', 500);
  }

  try {
    // List all files in the bucket
    const listResult = await bucket.list();
    const fileKeys = listResult.objects.map(obj => obj.key);
    console.log('Current objects in the bucket:', fileKeys); 

    // Remove the file extension from the keys in the bucket
    const baseFilenames = fileKeys.map(key => key.split('.')[0]);

    // Check if the requested filename (without extension) matches any file in the bucket
    const matchingIndex = baseFilenames.indexOf(requestedFilename.split('.')[0]);
    
    if (matchingIndex === -1) {
      console.log(`File matching ${requestedFilename} does not exist.`);
      return c.text('File not found', 404); 
    }

    // Fetch the object and its content type
    const matchingFileKey = fileKeys[matchingIndex]; // Get the original key
    const object = await bucket.get(matchingFileKey); 
    const contentType = object.httpMetadata.contentType; 
    const fileContents = await object.arrayBuffer(); // Use arrayBuffer for binary data
    
    console.log(`File ${matchingFileKey} fetched successfully with Content-Type: ${contentType}`);
    
    // Return both the content and the content type
    return c.json({ content: new TextDecoder().decode(fileContents), contentType }); 
  } catch (error) {
    console.error('Error fetching file:', error);
    return c.text('Error fetching file', 500); 
  }
});



app.post('upload/codeshare/:filename', async (c) => {
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
    const result = await bucket.list();
    console.log('Objects to delete:', result);

    if (result.objects && result.objects.length > 0) {
      const deletePromises = result.objects.map(obj => bucket.delete(obj.key));
      await Promise.all(deletePromises); 
      console.log('All objects deleted successfully.');
      return c.text('All objects deleted successfully.');
    } else {
      console.log('No objects to delete.');
      return c.text('No objects to delete.');
    }
  } catch (error) {
    console.error('Error in cleanup:', error); 
    return c.text('Error in cleanup', 500);
  }
});

export default app;
