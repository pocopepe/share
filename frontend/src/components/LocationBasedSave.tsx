
import { Button } from "@/components/ui/button";
import {useLocation} from 'react-router-dom';   
const LocationBasedSaveButton = () => {
    const location = useLocation();
    const currentPath = location.pathname;
  
    return currentPath === "/codeshare" ? (
      <Button variant="ghost" className="text-white hover:bg-gray-800 transition duration-200 ease-in-out">
        Save
      </Button>
    ) : null;
  };
  export default LocationBasedSaveButton;