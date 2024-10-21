import { Button } from "@/components/ui/button";
import { codeFileNameAtom, codeLanguageAtom, codeValueAtom, isAlertVisibleAtom } from "@/recoil/code";
import { useLocation } from 'react-router-dom';   
import { useRecoilValue, useSetRecoilState } from "recoil";



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

  const showAlert = () => {
    setIsAlertVisible('2');
    setTimeout(() => {
        setIsAlertVisible('0'); 
    }, 3000);
};

  const handleSaveClick = async () => {
    setIsAlertVisible('1');

    const contentType = fileTypeChecker(language); 
    console.log(contentType);
    const result = await datadrop(filename, code, contentType);
    console.log(result); 
    if (result === "success") {
      showAlert();
    }
  };
  const setIsAlertVisible=useSetRecoilState(isAlertVisibleAtom);

  return (
    currentPath.startsWith("/codeshare/") ? ( 
      <Button
        variant="ghost"
        className="text-white hover:bg-gray-800 transition duration-200 ease-in-out"
        onClick={handleSaveClick} 
      >
        Save
      </Button>
    ) : null
  );
};

export default LocationBasedSaveButton;
