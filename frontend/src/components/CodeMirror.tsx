import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { githubDarkInit } from '@uiw/codemirror-theme-github';
import { useCallback, useEffect } from 'react';
import { autocompletion } from '@codemirror/autocomplete';
import { useRecoilState, useRecoilValue } from 'recoil';
import { codeLanguageAtom, codeValueAtom } from '../recoil/code';

const CodeMirrorComponent: React.FC = () => {
    const [value, setValue] = useRecoilState(codeValueAtom);
    const language = useRecoilValue(codeLanguageAtom);
    const onChange = useCallback((val: string) => {
        console.log('val:', val);
        setValue(val);
    }, [setValue]);

    useEffect(() => {
        switch (language) {
            case 'javascript':
                setValue("console.log('Hello, World!');");
                break;
            case 'python':
                setValue("print('Hello, World!')");
                break;
            case 'html':
                setValue("<!DOCTYPE html><html><body><h1>Hello, World!</h1></body></html>");
                break;
            default:
                setValue("console.log('Language not supported!');");
        }
    }, [language, setValue]);

    return (
        <div className="h-full overflow-auto"> {/* Set height to full and enable scrolling */}
            <CodeMirror
                theme={githubDarkInit({
                    settings: {
                        caret: '#c6c6c6',
                        fontFamily: 'monospace',
                    }
                })}
                value={value}
                height="auto" // Allow CodeMirror to manage its height based on content
                extensions={[
                    javascript({ jsx: true }),
                    autocompletion(),
                ]}
                onChange={onChange}
            />
        </div>
    );
}

export default CodeMirrorComponent;
