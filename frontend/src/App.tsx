import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CodeShare from './pages/CodeShare'; // Import your pages
import Home from './pages/Home'; // Import your pages
import MyFiles from './pages/MyFiles'; // Import your pages
import LocationBasedSaveButton from "./components/LocationBasedSave";
import LocationBasedDropdown from "./components/LocationBasedButtons";
import { useState } from 'react';
import StarsParticles from "./components/tsparticles";

function App() {
  const [position, setPosition] = useState("python");

  return (
    <Router>
      <div className="flex flex-col h-screen bg-slate-700 relative">
        <StarsParticles /> 

        <nav className="bg-black-900 shadow-md relative z-10">
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-white text-xl font-bold">Share</h1>
            <div className="flex space-x-4">
              <LocationBasedSaveButton />
              <LocationBasedDropdown position={position} setPosition={setPosition} />
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
        <div className="flex-grow overflow-hidden relative z-10">
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
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
