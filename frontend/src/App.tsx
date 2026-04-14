import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import StarsParticles from "./components/tsparticles";
import Home from './pages/Home';
import NavBar from "./components/NavBar"; 
import { RecoilRoot } from "recoil";

const CodeShare = lazy(() => import("./pages/CodeShare"));
const MyFiles = lazy(() => import("./pages/MyFiles"));



function App() {
    const generateRandomString = (length: number) => {
        const characters = 'abcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
      };
    
    return (
        <RecoilRoot>
            <Router>
                <div className="flex flex-col h-screen bg-slate-700 relative">
                    <StarsParticles />
                    <NavBar />
                    <div className="flex-grow overflow-hidden relative z-10">
                        <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-white">Loading...</div>}>
                            <Routes>
                                <Route path="/" element={<Navigate to="/home" />} />
                                <Route path="/codeshare/:codeFile" element={<CodeShare />} />
                                <Route path="/codeshare" element={<Navigate to={`/codeshare/${generateRandomString(10)}`} replace />} />
                                <Route path="/home" element={<Home />} />
                                <Route path="/myfiles" element={<MyFiles />} />
                            </Routes>
                        </Suspense>
                    </div>
                </div>
            </Router>
        </RecoilRoot>
    );
}

export default App;
