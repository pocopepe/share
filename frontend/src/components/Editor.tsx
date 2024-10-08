import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

interface MonacoEditorProps {
  onChange: (content: string) => void; // Define the type for the onChange prop
  language: string; // Language prop for setting editor language (e.g. JavaScript, HTML, etc.)
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({ onChange, language }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null); // Type for Monaco editor instance
  const containerRef = useRef<HTMLDivElement | null>(null); // Type for the container DOM element

  useEffect(() => {
    // Set the Monaco Editor theme to VSCode Dark
    monaco.editor.defineTheme("vs-dark", {
      base: "vs-dark", // Can also be "vs" or "hc-black"
      inherit: true, // Whether to inherit from base theme
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
      // Create the Monaco editor instance
      const editor = monaco.editor.create(containerRef.current, {
        value: "",
        language: language, // Use the language prop to enable IntelliSense
        theme: "vs-dark", // Apply VSCode dark theme
        automaticLayout: true,
      });

      // Handle content change events
      editor.onDidChangeModelContent(() => {
        const code = editor.getValue();
        console.log(code); // Log the current code content
        onChange(code); // Call the onChange prop with updated content
      });

      editorRef.current = editor;

      // Clean up the editor on component unmount
      return () => {
        editor.dispose();
      };
    }
  }, [onChange, language]); // Re-run effect if onChange or language changes

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
};

export default MonacoEditor;
