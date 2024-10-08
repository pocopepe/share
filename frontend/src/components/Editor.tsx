import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

interface MonacoEditorProps {
  onChange: (content: string) => void; // Define the type for the onChange prop
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({ onChange }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null); // Use type for the editor
  const containerRef = useRef<HTMLDivElement | null>(null); // Use type for the container

  useEffect(() => {
    // Set the Monaco Editor theme to VSCode Dark
    monaco.editor.defineTheme("vs-dark", {
      base: "vs-dark", // can also be "vs", "hc-black"
      inherit: true, // whether to inherit from base theme
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
      // Create the Monaco editor
      const editor = monaco.editor.create(containerRef.current, {
        value: "",
        language: "javascript", // Set the default language
        theme: "vs-dark", // Set the theme to VSCode dark
        automaticLayout: true,
      });

      // Handle change events
      editor.onDidChangeModelContent(() => {
        const code = editor.getValue();
        console.log(code); // Log the code to console
        if (onChange) {
          onChange(code); // Call the onChange prop if provided
        }
      });

      editorRef.current = editor;

      // Clean up editor on component unmount
      return () => {
        editor.dispose();
      };
    }
  }, [onChange]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
};

export default MonacoEditor;
