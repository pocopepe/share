import CodeMirrorComponent from '@/components/CodeMirror';

const CodeShare: React.FC = () => {
    return (
        <div className="flex flex-col h-screen bg-slate-700">
            <div className="flex-grow"> {/* Allows the CodeMirror to expand */}
                <CodeMirrorComponent />
            </div>
        </div>
    );
};

export default CodeShare;
