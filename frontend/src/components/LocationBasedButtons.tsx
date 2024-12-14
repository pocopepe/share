import { useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRecoilState } from "recoil";
import { codeLanguageAtom, isCodesharePageAtom } from "@/recoil/code";

const LocationBasedDropdown: React.FC = () => {
  const [position, setPosition] = useRecoilState(codeLanguageAtom);
  const [isCodeSharePage, setCodeSharePage] = useRecoilState(isCodesharePageAtom);
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    if (currentPath.startsWith("/codeshare/")) {
      setCodeSharePage(true);
    } else {
      setCodeSharePage(false);
    }
  }, [currentPath, setCodeSharePage]);

  return isCodeSharePage ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-white hover:bg-[#222] hover:!text-[#b3b3b3] transition duration-200 ease-in-out">
          Language
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-gray-800 outline-black">
        <DropdownMenuLabel className="text-white">Select the language of your choice</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={(value) => setPosition(value)}>
          <DropdownMenuRadioItem className="text-white" value="javascript">JavaScript</DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="text-white" value="python">Python</DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="text-white" value="html">HTML</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null;
};

export default LocationBasedDropdown;
