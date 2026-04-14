import React, { useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { acceptCompletion, autocompletion } from "@codemirror/autocomplete";
import { indentLess, indentMore } from "@codemirror/commands";
import { Prec, type Extension } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { autosaveEnabledAtom, codeFileNameAtom, codeLanguageAtom, codeValueAtom } from "@/recoil/code";
import fetchCodeShare from "@/helpers/codeshare";
import datadrop from "@/helpers/datadrop";
import fileTypeChecker from "@/helpers/filetypechecker";

const editorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#1e1e1e",
      color: "#d4d4d4",
      height: "100%",
    },
    ".cm-editor": {
      backgroundColor: "#1e1e1e",
      color: "#d4d4d4",
      height: "100%",
    },
    ".cm-scroller": {
      backgroundColor: "#1e1e1e",
      fontFamily: "inherit",
    },
    ".cm-content": {
      caretColor: "#d4d4d4",
      backgroundColor: "#1e1e1e",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#d4d4d4",
    },
    ".cm-gutters": {
      backgroundColor: "#252526",
      color: "#858585",
      border: "none",
    },
    ".cm-activeLine": {
      backgroundColor: "#2a2d2e",
    },
    "&.cm-focused .cm-selectionBackground": {
      backgroundColor: "#264f78 !important",
    },
    ".cm-selectionBackground, .cm-selectionLayer .cm-selectionBackground, .cm-content ::selection, .cm-line::selection, .cm-line > span::selection": {
      backgroundColor: "#264f78 !important",
      color: "#ffffff",
    },
    ".cm-panels": {
      backgroundColor: "#252526",
      color: "#d4d4d4",
    },
    ".cm-tooltip": {
      border: "1px solid #454545",
      backgroundColor: "#252526",
      color: "#d4d4d4",
    },
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
      backgroundColor: "#04395e",
      color: "#d4d4d4",
    },
  },
  { dark: true },
);

const Editor: React.FC = () => {
  const language = useRecoilValue(codeLanguageAtom);
  const filename = useRecoilValue(codeFileNameAtom);
  const autosaveEnabled = useRecoilValue(autosaveEnabledAtom);
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
      editorTheme,
      Prec.highest(
        keymap.of([
          {
            key: "Tab",
            run: (view) => acceptCompletion(view) || indentMore(view),
            shift: indentLess,
            preventDefault: true,
          },
        ]),
      ),
      autocompletion(),
      ...(languageExtension ? [languageExtension] : []),
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
    if (!filename || !autosaveEnabled) {
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
  }, [filename, language, autosaveEnabled]);

  return (
    <div className="relative" style={{ height: "100%", width: "100%", background: "#1e1e1e" }}>
      <CodeMirror
        value={editorValue}
        height="100%"
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
        style={{ height: "100%", fontSize: "14px", backgroundColor: "#1e1e1e" }}
      />
    </div>
  );
};

export default Editor;
