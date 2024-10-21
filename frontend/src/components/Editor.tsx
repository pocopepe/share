import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { codeFileNameAtom, codeLanguageAtom, codeValueAtom } from "@/recoil/code";
import fileTypeChecker from "@/helpers/filetypechecker";

const MonacoEditor: React.FC = () => {
  const language = useRecoilValue(codeLanguageAtom);
  const filename = useRecoilValue(codeFileNameAtom);
  const setCode = useSetRecoilState(codeValueAtom);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initialValueRef = useRef<string>('');

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const url = `https://share-backend.avijusanjai.workers.dev/get/codeshare/${filename}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": fileTypeChecker(language, "filetype"),
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.content && data.content.trim() !== '') {
            initialValueRef.current = data.content;
            setCode(data.content);

            if (editorRef.current) {
              editorRef.current.setValue(data.content);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching code:", error);
      }
    };

    if (filename) {
      fetchCode();
    }
  }, [filename, language, setCode]);

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
        "editor.inactiveSelectionBackground": "#3a3d3d41",
      },
    });

    if (containerRef.current) {
      const editor = monaco.editor.create(containerRef.current, {
        value: initialValueRef.current,
        language: language,
        theme: "vs-dark",
        automaticLayout: true,
      });

      editor.onDidChangeModelContent(() => {
        const code = editor.getValue();
        setCode(code);
      });

      editorRef.current = editor;

      const resizeObserver = new ResizeObserver(() => {
        editor.layout();
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        editor.dispose();
        resizeObserver.disconnect();
      };
    }
  }, [language]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
};

export default MonacoEditor;
