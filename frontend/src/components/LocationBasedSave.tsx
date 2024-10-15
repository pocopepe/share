import { Button } from "@/components/ui/button";
import { useLocation } from 'react-router-dom';
import { codeValueAtom } from "@/recoil/code";
import { useRecoilValue } from "recoil";
import axios from 'axios';
import { useState } from 'react';

const LocationBasedSaveButton: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const code = useRecoilValue(codeValueAtom);
  const [filename, setFilename] = useState(''); // State to hold the filename input

  // Function to handle save action
  const handleSave = () => {
    const backend = `https://share-backend.avijusanjai.workers.dev/codeshare/${filename}`;
    const options = {
      method: 'POST',
      url: backend,
      headers: {
        'Content-Type': 'text/plain', // Set the content type to plain text
      },
      data: code
    };
    
    axios.request(options)
      .then(response => {
        console.log('File saved successfully:', response.data);
      })
      .catch(error => {
        console.error('Error saving file:', error);
      });
  };

  return currentPath === "/codeshare" ? (
    <div className="flex flex-col items-center space-y-4">
      {/* Text input for the filename */}
      <input
        type="text"
        placeholder="Enter filename"
        className="border p-2 rounded text-black"
        value={filename}
        onChange={(e) => setFilename(e.target.value)} // Update state with input value
      />
      
      {/* Save button */}
      <Button
        variant="ghost"
        className="text-white hover:bg-gray-800 transition duration-200 ease-in-out"
        onClick={handleSave} // onClick event to call the function
      >
        Save
      </Button>
    </div>
  ) : null;
};

export default LocationBasedSaveButton;
