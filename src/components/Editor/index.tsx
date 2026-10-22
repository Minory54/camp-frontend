import { useEffect } from "react";
import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor/editor";
import "monaco-editor/features/register.all";
import "monaco-editor/languages/definitions/html/register";
import "monaco-editor/languages/definitions/css/register";
import "monaco-editor/languages/features/html/register";
import "monaco-editor/languages/features/css/register";
import EditorWorker from "monaco-editor/editor/editor.worker?worker&inline";
import HtmlWorker from "monaco-editor/languages/features/html/html.worker?worker&inline";
import CssWorker from "monaco-editor/languages/features/css/css.worker?worker&inline";
import { getFileLanguage, type PracticeFile } from "../../pages/PracticePage/practiceFiles";

self.MonacoEnvironment = {
  getWorker(_moduleId, label) {
    if (label === "html") return new HtmlWorker();
    if (label === "css") return new CssWorker();
    return new EditorWorker();
  },
};
loader.config({ monaco });

type Props = {
  file: PracticeFile;
  value: string;
  modelPrefix: string;
  onChange: (value: string) => void;
};

export default function CodeEditor({ file, value, modelPrefix, onChange }: Props) {
  useEffect(
    () => () => {
      for (const model of monaco.editor.getModels()) {
        if (model.uri.toString().startsWith(modelPrefix)) model.dispose();
      }
    },
    [modelPrefix],
  );

  return (
    <Editor
      path={`${modelPrefix}${file.id}/${encodeURIComponent(file.filename)}`}
      language={getFileLanguage(file)}
      value={value}
      onChange={(next) => onChange(next ?? "")}
      saveViewState
      keepCurrentModel
      loading={<p className="practice__message">Загрузка редактора…</p>}
      options={{
        ariaLabel: `Редактор файла ${file.filename}`,
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        tabSize: 2,
        scrollBeyondLastLine: false,
        wordWrap: "on",
        padding: { top: 16, bottom: 16 },
        fixedOverflowWidgets: true,
      }}
    />
  );
}
