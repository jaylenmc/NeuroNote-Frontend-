import React, { useState, useEffect } from 'react';
import { FiPlay, FiCode, FiTerminal } from 'react-icons/fi';

const CodeEditor = ({ language = 'javascript', onCodeChange, initialCode = '' }) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    if (onCodeChange) {
      onCodeChange(code);
    }
  }, [code, onCodeChange]);

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const runCode = () => {
    setShowOutput(true);
    try {
      // For JavaScript, we can actually run it
      if (language === 'javascript' || language === 'js') {
        // Capture console.log output
        const logs = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.join(' '));
        };
        
        try {
          // eslint-disable-next-line no-eval
          const result = eval(code);
          console.log = originalLog;
          
          if (logs.length > 0) {
            setOutput(logs.join('\n'));
          } else if (result !== undefined) {
            setOutput(String(result));
          } else {
            setOutput('Code executed successfully (no output)');
          }
        } catch (error) {
          console.log = originalLog;
          setOutput(`Error: ${error.message}`);
        }
      } else {
        // For other languages, just show a placeholder
        setOutput(`Code submitted for ${language}. In a real implementation, this would be sent to a backend for execution.`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const getLanguageTemplate = (lang) => {
    switch (lang) {
      case 'python':
        return '# Write your Python code here\ndef solution():\n    # Your code\n    pass\n\nsolution()';
      case 'javascript':
      case 'js':
        return '// Write your JavaScript code here\nfunction solution() {\n    // Your code\n}\n\nsolution();';
      case 'typescript':
        return '// Write your TypeScript code here\nfunction solution(): void {\n    // Your code\n}\n\nsolution();';
      case 'java':
        return 'public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}';
      case 'cpp':
      case 'c++':
        return '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}';
      case 'c':
        return '#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}';
      case 'go':
        return 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Your code here\n}';
      case 'rust':
        return 'fn main() {\n    // Your code here\n}';
      case 'php':
        return '<?php\n// Write your PHP code here\n\nfunction solution() {\n    // Your code\n}\n\nsolution();\n?>';
      case 'ruby':
        return '# Write your Ruby code here\ndef solution\n    # Your code\nend\n\nsolution';
      case 'swift':
        return '// Write your Swift code here\nfunc solution() {\n    // Your code\n}\n\nsolution()';
      case 'kotlin':
        return '// Write your Kotlin code here\nfun main() {\n    // Your code here\n}';
      default:
        return '// Write your code here';
    }
  };

  const insertTemplate = () => {
    setCode(getLanguageTemplate(language));
  };

  const getFileExtension = (lang) => {
    const extensions = {
      'javascript': 'js',
      'typescript': 'ts',
      'python': 'py',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'rust': 'rs',
      'php': 'php',
      'ruby': 'rb',
      'swift': 'swift',
      'kotlin': 'kt'
    };
    return extensions[lang] || 'txt';
  };

  return (
    <div className="code-editor-container">
      <div className="editor-header">
        <div className="editor-tabs">
          <div className="editor-tab active">
            <FiCode />
            <span>solution.{getFileExtension(language)}</span>
          </div>
        </div>
        <div className="editor-actions">
          <button className="editor-btn" onClick={insertTemplate} title="Insert Template">
            Template
          </button>
          <button className="editor-btn run-btn" onClick={runCode} title="Run Code">
            <FiPlay />
            Run
          </button>
        </div>
      </div>
      
      <div className="editor-content">
        <div className="line-numbers">
          {code.split('\n').map((_, i) => (
            <div key={i} className="line-number">{i + 1}</div>
          ))}
        </div>
        <textarea
          className="code-textarea"
          value={code}
          onChange={handleCodeChange}
          placeholder={`Write your ${language} code here...`}
          spellCheck="false"
        />
      </div>
      
      {showOutput && (
        <div className="code-output">
          <div className="output-header">
            <FiTerminal />
            <span>Output</span>
          </div>
          <pre className="output-content">{output}</pre>
        </div>
      )}
      
      <div className="editor-hint">
        Write your code solution above. Click "Run" to test it, or "Template" for a starter template.
      </div>
    </div>
  );
};

export default CodeEditor;
