import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LocationBasedSaveButton from "./LocationBasedSave";
import LocationBasedDropdown from "./LocationBasedButtons";
import { useRecoilState } from "recoil";
import { isAlertVisibleAtom } from "@/recoil/code";
import { useLocation } from "react-router-dom";

const NavBar: React.FC = () => {
    const [isAlertVisible] = useRecoilState(isAlertVisibleAtom);
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <nav className="bg-900 shadow-md relative z-10">
            <div className="flex justify-between items-center px-6 py-4">
                <Link to='/home'>
                    <h1 className="text-white text-xl font-bold">Share</h1>
                </Link>

                {isAlertVisible === '2' ? (
                    <h1 className="text-white">saved successfully</h1>
                ) : isAlertVisible === '1' ? (
                    <h1 className="text-yellow-400">waities...</h1>
                ) : null}

                <div className="flex space-x-4">
                    <LocationBasedSaveButton />
                    <LocationBasedDropdown />
                    
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
        </nav>
    );
};

export default NavBar;
