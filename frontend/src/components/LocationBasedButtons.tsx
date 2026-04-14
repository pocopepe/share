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
  const selectedLabel = position === "javascript" ? "JavaScript" : position === "python" ? "Python" : position === "html" ? "HTML" : "Language";

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
        <Button
          variant="outline"
          className="group h-9 gap-2 rounded-full border-white/10 bg-white/5 px-4 text-sm font-medium text-zinc-100 shadow-sm backdrop-blur transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          <span>{selectedLabel}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.75"
            stroke="currentColor"
            className="h-4 w-4 text-zinc-400 transition-transform duration-200 group-data-[state=open]:rotate-180 group-hover:text-zinc-200"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-64 rounded-xl border border-white/10 bg-zinc-950/95 p-2 text-zinc-50 shadow-2xl backdrop-blur-md">
        <DropdownMenuLabel className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Select language
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-2 my-1 bg-white/10" />
        <DropdownMenuRadioGroup className="space-y-1" value={position} onValueChange={(value) => setPosition(value)}>
          <DropdownMenuRadioItem className="rounded-lg px-3 py-2 text-sm text-zinc-100 transition-colors focus:bg-white/10 focus:text-white data-[state=checked]:bg-white/10 data-[state=checked]:text-white" value="javascript">
            JavaScript
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="rounded-lg px-3 py-2 text-sm text-zinc-100 transition-colors focus:bg-white/10 focus:text-white data-[state=checked]:bg-white/10 data-[state=checked]:text-white" value="python">
            Python
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="rounded-lg px-3 py-2 text-sm text-zinc-100 transition-colors focus:bg-white/10 focus:text-white data-[state=checked]:bg-white/10 data-[state=checked]:text-white" value="html">
            HTML
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null;
};

export default LocationBasedDropdown;
