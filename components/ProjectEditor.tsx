'use client';

import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor, { OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import ACTIONS from '@/lib/action';
import { dbAction } from '@/appwrite/action';
import { useHotkeys } from "react-hotkeys-hook"
import toast from 'react-hot-toast';
import Loading from './Loading';

/* eslint-disable @typescript-eslint/no-explicit-any */
const ProjectEditor = ({
  onCodeChange,
  roomID,
  socketRef,
  ClientList
}: {
  onCodeChange: (code: string) => void;
  roomID: string;
  socketRef: any;
  ClientList: any;
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [language, setLanguage] = useState('');
  const [isRemoteChange, setIsRemoteChange] = useState(false);
  const [version, setVersion] = useState<string>('latest');
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [consoleHeight, setConsoleHeight] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const [Content, setContent] = useState<string>("");

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };


  const saveCode = async () => {
    if (!editorRef.current || !roomID) return;
    const code = editorRef.current.getValue();

    setIsSaveLoading(true);
    try {
      const res = await dbAction("update", { content: code }, roomID);
      if (res) {
        toast.success("saved successfully");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaveLoading(false);
    }
  }


  useHotkeys('ctrl+s', (e:any) => {
    e.preventDefault();
    saveCode();

  });

  useEffect(() => {
    const fetchData = async () => {
      if (!roomID) return;
      try {
        const res = (await dbAction("get", undefined, roomID)) as { language?: string; content?: string } | null;
        if (res) {
          setLanguage(res.language ?? "");
          setContent(res.content ?? "");
        }
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [roomID]);

  // Fetch runtime version
  const fetchVersion = async () => {
    try {
      const res = await fetch('https://emkc.org/api/v2/piston/runtimes');
      const runtimes = await res.json();
      console.log(language)
      const runtime = runtimes.find((r: any) => r.language === language);
      setVersion(runtime ? runtime.version : 'latest');
      console.log("version", runtimes);
    } catch {
      setVersion('unknown');
    }
  };

  // Run Code
  const runCode = async () => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();

    setIsLoading(true);
    await fetchVersion();

    try {
      const res = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          version,
          files: [{ name: 'main', content: code }],
        }),
      });

      const result = await res.json();
      console.log("version", result);
      setOutput(result.run?.output || 'No output');
    } catch (err) {
      console.error(err);
      setOutput('❌ Error running code');
    } finally {
      setIsLoading(false);
    }
  };

  // Local code change → emit
  useEffect(() => {
    if (!editorRef.current || !socketRef.current) return;
    const editor = editorRef.current;

    const sub = editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      onCodeChange(value);
      if (isRemoteChange) return;
      socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomID, code: value });
    });

    return () => sub.dispose();
  }, [socketRef.current, isRemoteChange]);

  // Remote code update listener
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;

    const handleCodeChange = ({ code }: { code: string }) => {
      if (!editorRef.current || code == null) return;
      const currentValue = editorRef.current.getValue();
      if (currentValue === code) return;

      setIsRemoteChange(true);
      editorRef.current.setValue(code);
      setIsRemoteChange(false);
    };

    socket.on(ACTIONS.CODE_CHANGE, handleCodeChange);
    return () => socket.off(ACTIONS.CODE_CHANGE, handleCodeChange);
  }, [socketRef.current]);

  // 🔹 SYNC_CODE handler
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;

    const handleSyncCode = ({ socketID }: { socketID: string }) => {
      if (!editorRef.current) return;
      const currentCode = editorRef.current.getValue();
      socket.emit(ACTIONS.SYNC_CODE, { socketID, code: currentCode });
    };
    if (ClientList.length === 1 && Content) {
      // First user to join, set the editor content
      if (editorRef.current) {
        editorRef.current.setValue(Content);
      }
    }
    socket.on(ACTIONS.SYNC_CODE, handleSyncCode);
    return () => socket.off(ACTIONS.SYNC_CODE, handleSyncCode);
  }, [socketRef.current, Content,ClientList]);

  // Console resize
  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const duringDrag = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newHeight = containerRect.bottom - e.clientY;
    if (newHeight > 80 && newHeight < 500) setConsoleHeight(newHeight);
  };


  const stopDrag = () => setIsDragging(false);

  useEffect(() => {
    window.addEventListener('mousemove', duringDrag);
    window.addEventListener('mouseup', stopDrag);
    return () => {
      window.removeEventListener('mousemove', duringDrag);
      window.removeEventListener('mouseup', stopDrag);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-[80vw] h-[100vh] bg-[#0B0B0B] text-white relative"
    >
      {/* Top Toolbar */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#111111] border-b border-white/10 z-20">

        <div>
          {
            language
          }
        </div>
        <div className='flex gap-8'>
          <button
            onClick={saveCode}
            disabled={isSaveLoading}
            className={`${isSaveLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
              } bg-gradient-to-r from-[#05f755] to-[#11ff60bb] text-white px-4 py-1.5 rounded-lg text-sm transition-all`}
          >
            {isSaveLoading ? 'Saving...' : 'Ctrl+S'}
          </button>
          <button
            onClick={runCode}
            disabled={isLoading}
            className={`${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
              } bg-gradient-to-r from-[#3B82F6] to-[#8a5cf6d2] text-white px-4 py-1.5 rounded-lg text-sm transition-all`}
          >
            {isLoading ? 'Running...' : '▶ Run'}
          </button>
        </div>
      </div>

      {/* Editor + Console */}
      <div className="relative flex-grow overflow-hidden">
        <MonacoEditor
          height={`calc(100% - ${consoleHeight}px)`}
          width="100%"
          defaultLanguage="javascript"
          language={language == 'c++' ? 'cpp' : language}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          loading={<Loading/>}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
          }}
        />

        {/* Divider */}
        <div
          onMouseDown={startDrag}
          className="h-2 cursor-row-resize bg-[#222] hover:bg-[#333] transition-colors absolute left-0 right-0"
          style={{ bottom: `${consoleHeight}px`, zIndex: 10 }}
        ></div>

        {/* Output Console */}
        <div
          style={{ height: `${consoleHeight}px` }}
          className="absolute bottom-0 left-0 right-0 bg-[#1B1B1B] border-t border-white/10 overflow-y-auto z-10"
        >
          <div className="p-3 text-sm font-mono text-gray-300 whitespace-pre-wrap">
            {output || '▶ Output will appear here...'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
