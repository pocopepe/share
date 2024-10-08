import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CodeShare from './pages/CodeShare'; // Import your pages
import Home from './pages/Home'; // Import your pages
import MyFiles from './pages/MyFiles'; // Import your pages
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useState} from 'react';

function App() {
  const [position, setPosition] = useState("python");
  return (
    <Router>
      <div className="flex flex-col h-screen bg-slate-700">
        {/* Navigation Bar */}
        <nav className="bg-gray-900 shadow-md">
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-white text-xl font-bold">Share</h1>
            <div className="flex space-x-4">
              <div>
            <DropdownMenu >
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-white hover:bg-gray-800 transition duration-200 ease-in-out">Language</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-gray-800 outline-black">
        <DropdownMenuLabel className="text-white" >Select the language of your Choice</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenuRadioItem className="text-white" value="javascript">JavaScript</DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="text-white" value="python">Python</DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="text-white" value="html">HTML</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
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

        {/* This div will grow to fill the remaining space */}
        <div className="flex-grow overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} /> {/* Redirect to /home */}
            <Route path="/codeshare" element={<CodeShare someString={position} />} />
            <Route path="/home" element={<Home />} />
            <Route path="/myfiles" element={<MyFiles />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
