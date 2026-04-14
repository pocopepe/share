import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LocationBasedSaveButton from "./LocationBasedSave";
import { useRecoilState } from "recoil";
import { autosaveEnabledAtom, codeFileNameAtom, codeLanguageAtom, isAlertVisibleAtom } from "@/recoil/code";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const LANGUAGE_TO_EXTENSION: Record<string, string> = {
    txt: ".txt",
    javascript: ".js",
    python: ".py",
    html: ".html",
};

const EXTENSION_TO_LANGUAGE: Record<string, string> = {
    ".txt": "txt",
    ".js": "javascript",
    ".py": "python",
    ".html": "html",
};

const removeKnownExtension = (name: string): string => {
    const lowered = name.toLowerCase();
    const knownExtensions = Object.keys(EXTENSION_TO_LANGUAGE);

    for (const ext of knownExtensions) {
        if (lowered.endsWith(ext)) {
            return name.slice(0, -ext.length);
        }
    }

    return name;
};

const NavBar: React.FC = () => {
    const [isAlertVisible] = useRecoilState(isAlertVisibleAtom);
    const [filename, setFilename] = useRecoilState(codeFileNameAtom);
    const [language, setLanguage] = useRecoilState(codeLanguageAtom);
    const [autosaveEnabled, setAutosaveEnabled] = useRecoilState(autosaveEnabledAtom);
    const [draftBaseName, setDraftBaseName] = useState(removeKnownExtension(filename));
    const location = useLocation();
    const currentPath = location.pathname;

    const selectedExtension = LANGUAGE_TO_EXTENSION[language] ?? ".txt";

    useEffect(() => {
        setDraftBaseName(removeKnownExtension(filename));
    }, [filename]);

    const commitFilename = () => {
        const baseName = draftBaseName.trim();
        const nextValue = `${baseName || "untitled"}${selectedExtension}`;

        if (nextValue === filename) {
            setDraftBaseName(removeKnownExtension(filename));
            return;
        }

        setFilename(nextValue);
    };

    const handleExtensionChange = (value: string) => {
        const nextLanguage = EXTENSION_TO_LANGUAGE[value] ?? "txt";
        const baseName = draftBaseName.trim() || "untitled";

        setLanguage(nextLanguage);
        setFilename(`${baseName}${value}`);
    };

    return (
        <nav className="relative z-20 h-[84px] bg-transparent">
            <div className="flex h-full items-center gap-4 px-4 md:px-6">
                <Link to='/home'>
                    <h1 className="text-xl font-bold tracking-wide text-white">Share</h1>
                </Link>

                <div className="flex flex-1 items-center justify-center px-2 md:px-6">
                    {currentPath.startsWith("/codeshare/") && (
                        <div className="flex w-full max-w-xl items-center gap-2">
                            <Input
                                value={draftBaseName}
                                onChange={(event) => setDraftBaseName(event.target.value)}
                                onBlur={commitFilename}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        commitFilename();
                                    }
                                }}
                                spellCheck={false}
                                className="h-10 rounded-full border-white/10 bg-white/5 px-4 text-sm text-zinc-50 placeholder:text-zinc-500 shadow-sm backdrop-blur focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/20"
                                placeholder="untitled"
                            />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-10 rounded-full border-white/10 bg-white/5 px-4 text-sm text-zinc-100 shadow-sm backdrop-blur transition-colors hover:border-white/20 hover:bg-white/10"
                                    >
                                        {selectedExtension}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="min-w-[110px] rounded-xl border border-white/10 bg-zinc-950/95 p-1.5 text-zinc-50 shadow-2xl backdrop-blur-md">
                                    <DropdownMenuRadioGroup value={selectedExtension} onValueChange={handleExtensionChange}>
                                        <DropdownMenuRadioItem className="rounded-md px-3 py-2 text-sm focus:bg-white/10 data-[state=checked]:bg-white/10" value=".txt">.txt</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem className="rounded-md px-3 py-2 text-sm focus:bg-white/10 data-[state=checked]:bg-white/10" value=".js">.js</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem className="rounded-md px-3 py-2 text-sm focus:bg-white/10 data-[state=checked]:bg-white/10" value=".py">.py</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem className="rounded-md px-3 py-2 text-sm focus:bg-white/10 data-[state=checked]:bg-white/10" value=".html">.html</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 md:justify-end">
                    {isAlertVisible === '2' ? (
                        <h1 className="hidden text-white md:block">saved successfully</h1>
                    ) : isAlertVisible === '1' ? (
                        <h1 className="hidden text-yellow-400 md:block">waities...</h1>
                    ) : null}

                    <div className="flex items-center gap-2 md:gap-3">
                        <LocationBasedSaveButton />

                        {currentPath.startsWith("/codeshare/") && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAutosaveEnabled((current) => !current)}
                                className="h-9 rounded-full border-white/10 bg-white/5 px-4 text-sm font-medium text-zinc-100 shadow-sm backdrop-blur transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
                            >
                                Autosave: {autosaveEnabled ? "On" : "Off"}
                            </Button>
                        )}

                        {!(currentPath.startsWith('/codeshare')) && (
                            <Link to="/codeshare">
                                <Button variant="ghost" className="text-white hover:bg-[#222] hover:!text-[#b3b3b3] transition duration-200 ease-in-out">
                                    Code Share
                                </Button>
                            </Link>
                        )}

                        <Link to="/home">
                            <Button variant="ghost" className="text-white hover:bg-[#222] hover:!text-[#b3b3b3] transition duration-200 ease-in-out">
                                Home
                            </Button>
                        </Link>

                        <Link to="/myfiles">
                            <Button variant="ghost" className="text-white hover:bg-[#222] hover:!text-[#b3b3b3] transition duration-200 ease-in-out">
                                My Files
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
