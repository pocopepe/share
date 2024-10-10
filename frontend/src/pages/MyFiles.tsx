import React, { useState } from 'react';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();


const r2BucketName = process.env.R2_BUCKET_NAME; // Your R2 bucket name
const r2Endpoint =  process.env.R2_ENDPOINT ; // Your R2 endpoint
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID ; // Your R2 access key
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY ; // Your R2 secret key

// Initialize S3 client for R2
const s3Client = new S3Client({
  endpoint: r2Endpoint,
  region: 'auto',
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
  },
});

function MyFiles() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    const uploadParams = {
      Bucket: r2BucketName,
      Key: selectedFile.name,
      Body: selectedFile,
      ContentType: selectedFile.type,
    };

    try {
      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);
      alert('File uploaded successfully!');
      setSelectedFile(null); // Reset the file input
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    }
  };

  return (
    <div>
      <h2>Upload Files</h2>
      <input
        type="file"
        onChange={handleFileChange}
        accept="application/pdf, image/*" // Modify this as needed to allow specific file types
      />
      <button onClick={handleUpload}>Upload Selected File</button>
      {selectedFile && <p>Selected File: {selectedFile.name}</p>}
    </div>
  );
}

export default MyFiles;
