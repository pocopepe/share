import MonacoEditor from '@/components/Editor';
import { codeFileNameAtom } from '@/recoil/code';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

const CodeShare: React.FC = () => {
    const { codeFile } = useParams<{ codeFile: string }>();
    const setCodeFileName = useSetRecoilState(codeFileNameAtom);

    useEffect(() => {
        if (codeFile) {
            setCodeFileName(codeFile);
        } else {
            setCodeFileName('FallBackName-Y6byj01E9suT'); // Use a default name if codeFile is undefined
        }

        return () => {
            setCodeFileName(''); // Cleanup on unmount
        };
    }, [codeFile, setCodeFileName]);

    return (
        <div className="flex flex-col h-screen bg-slate-700">
            <div className="flex-grow">
                <MonacoEditor />
            </div>
        </div>
    );
};

export default CodeShare;
