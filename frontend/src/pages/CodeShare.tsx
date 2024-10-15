import MonacoEditor from '@/components/Editor';


const CodeShare: React.FC = () => {
    return (
        <div className="flex flex-col h-screen bg-slate-700">
            <div className="flex-grow"> 
              <MonacoEditor></MonacoEditor>
            </div>
        </div>
    );
};

export default CodeShare;
