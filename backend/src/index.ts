import { Hono } from 'hono';
import { IncomingForm, Files, Fields, File  } from 'formidable';

const app = new Hono();


// Route for the root
app.get('/', (c) => c.text('Hello Cloudflare Workers!'));

app.get('/myfiles', async (c)=>{
  const bucket = c.env.bucket; // Reference the bucket binding defined in wrangler.toml
  try {
    // Ensure the request contains multipart form data
    if (!c.req.headers.get('content-type')?.includes('multipart/form-data')) {
      return c.text('Invalid content type', 400);
    }

    // Parse form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File; // Assuming file field is named 'file'

    if (!file) {
      return c.text('No file uploaded', 400);
    }

    // Prepare file contents and metadata
    const fileContent = await file.arrayBuffer();
    const contentType = file.type || 'application/octet-stream';

    // Upload the file to R2 using bucket.put
    await bucket.put(file.name, fileContent, {
      httpMetadata: {
        contentType: contentType, 
      },
    });

    return c.text(`File uploaded successfully: ${file.name}`);
  } catch (error) {
    console.error('Error uploading file:', error);
    return c.text('Failed to upload file', 500);
  }});



// Route for codeshare with filename parameter
app.post('/codeshare/:filename', async (c) => {
  const filename = c.req.param('filename'); // Get the 'filename' parameter from the request

  // Log the request details for debugging
  console.log('Received request for filename:', filename);

  // Define your R2 bucket
  const bucket = c.env.MY_BUCKET; // Ensure this matches your binding in wrangler.toml

  if (!bucket) {
    console.error('Bucket is undefined. Check your wrangler.toml for binding.');
    return c.text('Internal server error: Bucket not found.', 500);
  }

  try {
    // Log the headers for debugging
    console.log('Request headers:', c.req.headers);

    // Check Content-Type
    const contentType = c.req.headers.get('Content-Type');
    let fileContent = '';

    // Handle JSON body
    if (contentType === 'application/json') {
      const body = await c.req.json(); // Assuming the body is sent as JSON
      fileContent = body.content || ''; // Extract 'content' from the body
      console.log('Received JSON content:', fileContent);
    } else if (contentType === 'text/plain') {
      // Handle plain text body
      fileContent = await c.req.text(); // Fallback to reading plain text
      console.log('Received plain text content:', fileContent);
    } else {
      return c.text('Unsupported Content-Type. Please send JSON or plain text.', 400);
    }

    const objectKey = `${filename}.txt`; // Name the file with .txt extension

    // Log the content being saved for debugging
    console.log('Saving content:', fileContent);

    await bucket.put(objectKey, fileContent, {
      httpMetadata: {
        contentType: 'text/plain', // Set the content type to text/plain
      },
    });
    
    return c.text(`File ${objectKey} created successfully with content.`); // Return success message
  } catch (error) {
    console.error('Error creating file:', error);
    return c.text(`Error creating file: ${error.message}`, 500); // Return detailed error message
  }
});

export default app;
