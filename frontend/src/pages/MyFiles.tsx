import { useState } from 'react';
import { Button } from "@/components/ui/button";


function MyFiles() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://share-backend.avijusanjai.workers.dev/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('File uploaded successfully!');
        setSelectedFile(null); // Clear the selected file
      } else {
        alert('File upload failed.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred while uploading the file.');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <input 
        type="file" 
        onChange={handleFileChange} 
        className="mt-4" 
      />
      <div className="flex space-x-4">
        <Button onClick={handleUpload}>Upload</Button>
        <Button onClick={() => alert('Browse user storage feature coming soon!')}>Browse</Button>
      </div>
    </div>
  );
}

export default MyFiles;
