import { Suspense, lazy, useEffect } from 'react';
import { codeFileNameAtom, codeLanguageAtom } from '@/recoil/code';
import { useParams } from 'react-router-dom';
import {useSetRecoilState } from 'recoil';

const MonacoEditor = lazy(() => import('@/components/Editor'));

const CodeShare: React.FC = () => {
  const { codeFile } = useParams<{ codeFile: string }>();
  const setCodeFileName = useSetRecoilState(codeFileNameAtom);
  const setCodeLanguage = useSetRecoilState(codeLanguageAtom);

  const extensionToLanguage = (name: string): string => {
    const lowered = name.toLowerCase();

    if (lowered.endsWith('.js')) {
      return 'javascript';
    }

    if (lowered.endsWith('.py')) {
      return 'python';
    }

    if (lowered.endsWith('.html')) {
      return 'html';
    }

    return 'txt';
  };

  useEffect(() => {
    if (codeFile) {
      setCodeFileName(codeFile);
      setCodeLanguage(extensionToLanguage(codeFile));
    } else {
      setCodeFileName('mintcode00');
      setCodeLanguage('txt');
    }

    return () => {
      setCodeFileName(''); 
      setCodeLanguage('txt');
    };
  }, [codeFile, setCodeFileName, setCodeLanguage]);

  return (
    <div className="flex h-[calc(100vh-84px)] flex-col bg-transparent">
      <div className="flex-grow">
        <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-white">Loading editor...</div>}>
          <MonacoEditor />
        </Suspense>
      </div>
    </div>
  );
};

export default CodeShare;
