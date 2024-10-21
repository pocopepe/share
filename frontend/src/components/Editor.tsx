import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { useRecoilState, useRecoilValue } from "recoil";
import { codeLanguageAtom, codeValueAtom } from "@/recoil/code";

const MonacoEditor: React.FC = () => {
  const language = useRecoilValue(codeLanguageAtom);
  const [value, setValue] = useRecoilState(codeValueAtom);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Define the worker URL
    (window as any).MonacoEnvironment = {
      getWorkerUrl: function (label: string) {
        return `data:text/javascript;charset=utf-8,"${encodeURIComponent(`
          importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/worker.js');
          importScripts('https://unpkg.com/monaco-editor@latest/min/vs/language/${label}/${label}Worker.js');
        `)}"`;
      },
    };

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
        setValue(code);
      });

      editorRef.current = editor;

      return () => {
        editor.dispose();
      };
    }
  }, [language, value, setValue]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
};

export default MonacoEditor;
