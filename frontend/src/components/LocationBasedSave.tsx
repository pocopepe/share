import { Button } from "@/components/ui/button";
import { codeFileNameAtom, codeLanguageAtom, codeValueAtom, isAlertVisibleAtom } from "@/recoil/code";
import { useLocation } from 'react-router-dom';   
import { useRecoilValue, useSetRecoilState } from "recoil";
import  fileTypeChecker  from "@/helpers/filetypechecker";
import datadrop from "@/helpers/datadrop";

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

    const result = await datadrop(filename, code, fileTypeChecker(language, "filetype"));
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
