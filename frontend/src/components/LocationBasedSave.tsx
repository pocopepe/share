import { Button } from "@/components/ui/button";
import { useLocation } from 'react-router-dom';
import { codeValueAtom } from "@/recoil/code";
import { useRecoilValue } from "recoil";
import axios from 'axios';

const LocationBasedSaveButton: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const code=useRecoilValue(codeValueAtom);

  // Function to handle save action
  const handleSave = () => {
    const backend='https://share-backend.avijusanjai.workers.dev/codeshare/grrrmeh';
    const options={
        method: 'POST', 
        url : backend,
        headers: {
            'Content-Type': 'text/plain', // Set the content type to plain text
          },
        
        data:code
    }
    axios.request(options);
  };

  return currentPath === "/codeshare" ? (
    <Button
      variant="ghost"
      className="text-white hover:bg-gray-800 transition duration-200 ease-in-out"
      onClick={handleSave} // onClick event to call the function
    >
      Save
    </Button>
  ) : null;
};

export default LocationBasedSaveButton;
