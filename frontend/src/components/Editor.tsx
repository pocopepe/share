import React, { useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { acceptCompletion, autocompletion } from "@codemirror/autocomplete";
import { indentWithTab } from "@codemirror/commands";
import { oneDark } from "@codemirror/theme-one-dark";
import type { Extension } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { codeFileNameAtom, codeLanguageAtom, codeValueAtom } from "@/recoil/code";
import fetchCodeShare from "@/helpers/codeshare";
import datadrop from "@/helpers/datadrop";
import fileTypeChecker from "@/helpers/filetypechecker";

const Editor: React.FC = () => {
  const language = useRecoilValue(codeLanguageAtom);
  const filename = useRecoilValue(codeFileNameAtom);
  const setCode = useSetRecoilState(codeValueAtom);
  const [editorValue, setEditorValue] = useState<string>("");
  const [languageExtension, setLanguageExtension] = useState<Extension | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const isLoadedRef = useRef(false);
  const dirtyRef = useRef(false);
  const lastSavedValueRef = useRef<string>("");
  const latestValueRef = useRef<string>("");
  const autosaveTimerRef = useRef<number | null>(null);
  const saveInFlightRef = useRef(false);

  const extensions = useMemo<Extension[]>(
    () => [
      keymap.of([
        {
          key: "Tab",
          run: acceptCompletion,
        },
      ]),
      autocompletion(),
      ...(languageExtension ? [languageExtension] : []),
      keymap.of([indentWithTab]),
    ],
    [languageExtension],
  );

  const saveCurrentValue = async (value: string): Promise<void> => {
    if (!filename || !isLoadedRef.current) {
      return;
    }

    if (saveInFlightRef.current || value === lastSavedValueRef.current) {
      return;
    }

    saveInFlightRef.current = true;
    setSaveState("saving");

    try {
      const result = await datadrop(filename, value, fileTypeChecker(language, "filetype"));
      if (result.ok) {
        lastSavedValueRef.current = value;
        dirtyRef.current = false;
        setSaveState("saved");
      } else {
        setSaveState("error");
      }
    } catch (error) {
      console.error("Autosave failed:", error);
      setSaveState("error");
    } finally {
      saveInFlightRef.current = false;
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const loadLanguageExtension = async (): Promise<void> => {
      try {
        if (language === "javascript") {
          const mod = await import("@codemirror/lang-javascript");
          if (!isCancelled) {
            setLanguageExtension(mod.javascript());
          }
          return;
        }

        if (language === "python") {
          const mod = await import("@codemirror/lang-python");
          if (!isCancelled) {
            setLanguageExtension(mod.python());
          }
          return;
        }

        if (language === "html") {
          const mod = await import("@codemirror/lang-html");
          if (!isCancelled) {
            setLanguageExtension(mod.html());
          }
          return;
        }

        if (!isCancelled) {
          setLanguageExtension(null);
        }
      } catch (error) {
        console.error("Error loading language extension:", error);
        if (!isCancelled) {
          setLanguageExtension(null);
        }
      }
    };

    void loadLanguageExtension();

    return () => {
      isCancelled = true;
    };
  }, [language]);

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const data = await fetchCodeShare(filename);
        if (data.content && data.content.trim() !== '') {
          setEditorValue(data.content);
          latestValueRef.current = data.content;
          setCode(data.content);
          lastSavedValueRef.current = data.content;
        } else {
          setEditorValue("");
          latestValueRef.current = "";
          setCode("");
          lastSavedValueRef.current = "";
        }
        isLoadedRef.current = true;
        dirtyRef.current = false;
        setSaveState("idle");
      } catch (error) {
        console.error("Error fetching code:", error);
      }
    };

    if (filename) {
      fetchCode();
    }
  }, [filename, setCode]);

  useEffect(() => {
    if (!filename) {
      return;
    }

    autosaveTimerRef.current = window.setInterval(() => {
      if (dirtyRef.current && isLoadedRef.current) {
        void saveCurrentValue(latestValueRef.current);
      }
    }, 10000);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearInterval(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [filename, language]);

  return (
    <div style={{ height: "100%", width: "100%", background: "#000" }}>
      <div className="absolute top-3 right-4 z-20 rounded-md bg-black/80 px-3 py-1 text-xs text-white border border-white/10">
        {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : saveState === "error" ? "Save failed" : "Autosave on"}
      </div>
      <CodeMirror
        value={editorValue}
        height="100%"
        theme={oneDark}
        extensions={extensions}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          autocompletion: true,
          closeBrackets: true,
          closeBracketsKeymap: true,
          completionKeymap: true,
          indentOnInput: true,
          bracketMatching: true,
          highlightSelectionMatches: true,
          syntaxHighlighting: true,
        }}
        onChange={(value) => {
          setEditorValue(value);
          latestValueRef.current = value;
          setCode(value);
          dirtyRef.current = true;
          setSaveState("idle");
        }}
        style={{ height: "100%", fontSize: "14px", backgroundColor: "#000" }}
      />
    </div>
  );
};

export default Editor;
