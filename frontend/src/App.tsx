import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import StarsParticles from "./components/tsparticles";
import Home from './pages/Home';
import NavBar from "./components/NavBar"; 
import { RecoilRoot } from "recoil";

const CodeShare = lazy(() => import("./pages/CodeShare"));
const MyFiles = lazy(() => import("./pages/MyFiles"));

const SHORT_WORDS = [
    "aero", "beam", "bend", "bird", "blue", "calm", "code", "dawn", "dust", "echo",
    "fern", "fire", "flux", "glow", "gold", "grid", "haze", "iris", "jade", "jolt",
    "keen", "kite", "lava", "leaf", "lime", "loop", "mint", "mist", "moon", "moss",
    "navy", "node", "opal", "peak", "pine", "pink", "play", "plot", "rain", "reef",
    "ring", "rose", "ruby", "sage", "sand", "seed", "silk", "snow", "star", "surf",
    "teal", "tide", "tiny", "tone", "tree", "wave", "wind", "wire", "wolf", "zeal",
];

const randomItem = (items: string[]): string =>
    items[Math.floor(Math.random() * items.length)];

const generateShareCode = (): string => {
    const first = randomItem(SHORT_WORDS);
    const second = randomItem(SHORT_WORDS);
    const number = String(Math.floor(Math.random() * 100)).padStart(2, "0");
    return `${first}${second}${number}`;
};
function App() {

    return (
        <RecoilRoot>
            <Router>
                <div className="relative flex h-screen flex-col overflow-hidden bg-slate-950">
                    <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_10%_20%,rgba(56,189,248,0.18),transparent_38%),radial-gradient(circle_at_85%_10%,rgba(168,85,247,0.16),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(14,116,144,0.22),transparent_48%)]" />
                    <StarsParticles />
                    <NavBar />
                    <div className="relative z-10 flex-grow overflow-y-auto">
                        <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-white">Loading...</div>}>
                            <Routes>
                                <Route path="/" element={<Navigate to="/home" />} />
                                <Route path="/codeshare/:codeFile" element={<CodeShare />} />
                                <Route path="/codeshare" element={<Navigate to={`/codeshare/${generateShareCode()}`} replace />} />
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
