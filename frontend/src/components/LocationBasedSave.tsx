import { Button } from "@/components/ui/button";
import { codeFileNameAtom, codeLanguageAtom, codeValueAtom } from "@/recoil/code";
import { useLocation } from 'react-router-dom';   
import { useRecoilValue } from "recoil";

async function datadrop(filename: string, content: string, contentType: string) {
  const url = 'https://share-backend.avijusanjai.workers.dev/codeshare/' + filename;
  try {
    const response = await fetch(url, {
      method: "POST",
      body: content,
      headers: {
        "Content-Type": contentType
      }
    });

    if (response.ok) {
      return "success"; 
    } else {
      return filename;
    }
  } catch (error) {
    console.error('Error saving data:', error);
    return "error"; 
  }
}

function fileTypeChecker(language:string){
  if(language==='javascript'){
    return 'application/javascript';
}
else if(language==='python'){
    return 'application/x-python';
}
else if(language==='html'){
    return 'text/html';
}
else{
    return 'text/plain';
}
}

const LocationBasedSaveButton = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const language= useRecoilValue(codeLanguageAtom);
  const filename = useRecoilValue(codeFileNameAtom);
  const code = useRecoilValue(codeValueAtom);
  

  const handleSaveClick = async () => {
    const contentType = fileTypeChecker(language); 
    console.log(contentType);
    const result = await datadrop(filename, code, contentType);
    console.log(result); 
  };

  return (
    currentPath.startsWith("/codeshare/") ? ( // Change to startsWith
      <Button
        variant="ghost"
        className="text-white hover:bg-gray-800 transition duration-200 ease-in-out"
        onClick={handleSaveClick} // Call handleSaveClick directly
      >
        Save
      </Button>
    ) : null
  );
};

export default LocationBasedSaveButton;
