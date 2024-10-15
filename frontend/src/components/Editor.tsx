import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { useRecoilState, useRecoilValue } from "recoil";
import { codeLanguageAtom, codeValueAtom } from "@/recoil/code";



const MonacoEditor: React.FC = () => {

  const language= useRecoilValue(codeLanguageAtom);
  const [value, setValue]=useRecoilState(codeValueAtom);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null); 
  const containerRef = useRef<HTMLDivElement | null>(null); 

  useEffect(() => {
    if (language=="python"){
      setValue("print('hello, world')");
    }
    else if (language=="javascript"){
      setValue("console.log('hello, world')")
    }
    else if (language=="html"){
      setValue("<h1>hello, world</h1>")
    }
}, [language]);


  useEffect(() => {
    monaco.editor.defineTheme("vs-dark", {
      base: "vs-dark", 
      inherit: true,
      rules: [],
      colors: {
        "editor.foreground": "#ffffff",
        "editor.background": "#1e1e1e",
        "editorCursor.foreground": "#ffffff",
        "editor.lineHighlightBackground": "#2a2a2a",
        "editorLineNumber.foreground": "#5c5c5c",
        "editor.selectionBackground": "#264f78",
        "editor.inactiveSelectionBackground": "#3a3d41",
      },
    });

    if (containerRef.current) {
      const editor = monaco.editor.create(containerRef.current, {
        value: value,
        language: language, 
        theme: "vs-dark", 
        automaticLayout: true,
      });

      editor.onDidChangeModelContent(() => {
        const code = editor.getValue();
        console.log(code); 
        setValue(code);
      });

      editorRef.current = editor;

      return () => {
        editor.dispose();
      };
    }
  }, [language]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
};

export default MonacoEditor;
