import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-dark.css';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language?: string;
  readOnly?: boolean;
}

export function CodeEditor({ code, onChange, language = 'python', readOnly = false }: CodeEditorProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-[#1e1e1e] shadow-inner font-mono text-sm relative group">
      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-xs text-muted-foreground bg-black/50 px-2 py-1 rounded">Python 3.10</span>
      </div>
      <Editor
        value={code}
        onValueChange={onChange}
        highlight={code => highlight(code, languages.python, 'python')}
        padding={20}
        readOnly={readOnly}
        className="font-mono min-h-[400px] outline-none"
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 14,
          backgroundColor: 'transparent',
        }}
        textareaClassName="focus:outline-none"
      />
    </div>
  );
}
