import MonacoEditor from '@/components/Editor';
import { codeLanguageAtom } from '@/recoil/code';
import { useRecoilValue } from 'recoil';

const CodeShare: React.FC = () => {
    const language=useRecoilValue(codeLanguageAtom);
    return (
        <div className="flex flex-col h-screen bg-slate-700">
            <div className="flex-grow"> 
              <div>{language}</div>
              <MonacoEditor></MonacoEditor>
            </div>
        </div>
    );
};

export default CodeShare;
