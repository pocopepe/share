// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import StarsParticles from "./components/tsparticles";
import CodeShare from './pages/CodeShare';
import Home from './pages/Home';
import MyFiles from './pages/MyFiles';
import NavBar from "./components/NavBar"; // Import the NavBar component
import { RecoilRoot } from "recoil";

function App() {
    return (
        <RecoilRoot>
            <Router>
                <div className="flex flex-col h-screen bg-slate-700 relative">
                    <StarsParticles />
                    <NavBar />
                    <div className="flex-grow overflow-hidden relative z-10">
                        <Routes>
                            <Route path="/" element={<Navigate to="/home" />} />
                            <Route path="/codeshare" element={<CodeShare />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/myfiles" element={<MyFiles />} />
                        </Routes>
                    </div>
                </div>
            </Router>
        </RecoilRoot>
    );
}

export default App;
