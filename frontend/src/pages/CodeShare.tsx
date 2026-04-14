import { Suspense, lazy, useEffect } from 'react';
import { codeFileNameAtom } from '@/recoil/code';
import { useParams } from 'react-router-dom';
import {useSetRecoilState } from 'recoil';

const MonacoEditor = lazy(() => import('@/components/Editor'));

const CodeShare: React.FC = () => {
  const { codeFile } = useParams<{ codeFile: string }>();
  const setCodeFileName = useSetRecoilState(codeFileNameAtom);
  

  useEffect(() => {
    if (codeFile) {
      setCodeFileName(codeFile);
    } else {
      setCodeFileName('FallBackName-Y6byj01E9suT');
    }

    return () => {
      setCodeFileName(''); 
    };
  }, [codeFile, setCodeFileName]);

  return (
    <div className="flex flex-col h-screen bg-slate-700">
      <div className="flex-grow">
        <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-white">Loading editor...</div>}>
          <MonacoEditor />
        </Suspense>
      </div>
    </div>
  );
};

export default CodeShare;
