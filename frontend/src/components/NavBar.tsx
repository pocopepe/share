import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LocationBasedSaveButton from "./LocationBasedSave";
import LocationBasedDropdown from "./LocationBasedButtons";
import { useRecoilState } from "recoil";
import { isAlertVisibleAtom } from "@/recoil/code";


const NavBar: React.FC = () => {
    const [isAelertVisible]=useRecoilState(isAlertVisibleAtom);
    

    return (
        <nav className="bg--900 shadow-md relative z-10">
            <div className="flex justify-between items-center px-6 py-4">
                <h1 className="text-white text-xl font-bold">Share</h1>
                
                {isAelertVisible === '2' ? (
  <h1 className="text-white">saved successfully</h1>
) : isAelertVisible === '1' ? (
  <h1 className="text-yellow-400">waities...</h1>
) : null}

                <div className="flex space-x-4">
                    <LocationBasedSaveButton />
                    <LocationBasedDropdown />
                    <Link to="/codeshare">
                        <Button variant="ghost" className="text-white hover:bg-gray-800 transition duration-200 ease-in-out">
                            Code Share
                        </Button>
                    </Link>
                    <Link to="/home">
                        <Button variant="ghost" className="text-white hover:bg-gray-800 transition duration-200 ease-in-out">
                            Home
                        </Button>
                    </Link>
                    <Link to="/myfiles">
                        <Button variant="ghost" className="text-white hover:bg-gray-800 transition duration-200 ease-in-out">
                            My Files
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
