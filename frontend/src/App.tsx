import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CodeShare from './pages/CodeShare'; // Import your pages
import Home from './pages/Home'; // Import your pages
import MyFiles from './pages/MyFiles'; // Import your pages

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen bg-slate-700">
        {/* Navigation Bar */}
        <nav className="bg-gray-900 shadow-md">
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-white text-xl font-bold">Share</h1>
            <div className="flex space-x-4">
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
            <Route path="/codeshare" element={<CodeShare />} />
            <Route path="/home" element={<Home />} />
            <Route path="/myfiles" element={<MyFiles />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
