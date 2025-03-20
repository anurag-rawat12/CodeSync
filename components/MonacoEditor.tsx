"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { Button } from "./ui/button";
import { Code2, Terminal } from "lucide-react";
import { usePathname } from "next/navigation";
import db from "@/appwrite/action";
import Collaboration from "./Collaboration";

const MonacoEditor = () => {
  const path = usePathname();
  const projectID = useMemo(() => path?.split("/").pop(), [path]);
  const [modifiedContent, setModifiedContent] = useState<string>("");
  const [language, setLanguage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ans, setAns] = useState<{ stdout: string; stderr: string; output: string } | null>(null);
  const [toggle, setToggle] = useState<"editor" | "console">("editor");
  const [version, setVersion] = useState("loading...");
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  /** 🔹 Debounce Function */
  const debounce = useCallback((func: (...args: []) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: []) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  }, []);

  /** 🔹 Initialize WebSocket */
  useEffect(() => {
    if (!projectID) return;

    if (socketRef.current) {
      return;
    }

    const socket = new WebSocket(`wss://codesync-85no.onrender.com/ws?project=${projectID}`);
    socketRef.current = socket;
socket.onopen = () => {
  console.log('✅ Connected to WebSocket');

  // **🔥 Keep Connection Alive (Send Ping Every 25s)**
  setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'ping' }));
    }
  }, 25000);
};
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "update" && data.content !== modifiedContent) {
        setModifiedContent(data.content);
      }
    };

    socket.onerror = (error) => console.error("❌ WebSocket Error:", error);
    socket.onclose = () => {
      setTimeout(() => {
        socketRef.current = null;
        if (projectID) {
          new WebSocket(`wss://codesync-85no.onrender.com/ws?project=${projectID}`);
        }
      }, 3000);
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectID]);

  /** 🔹 Fetch Initial Content from Appwrite */
  useEffect(() => {
    const fetchData = async () => {
      if (!projectID) return;

      try {
        const res = await db.projects.get(projectID);
        if (res) {
          setLanguage(res.language);
          setModifiedContent(res.content);
        }
      } catch (error) {
        console.error("❌ Error fetching project:", error);
      }
    };

    fetchData();
  }, [projectID]);

  /** 🔹 Save Content with Debounce */
  const saveContent = useCallback(
    (content: string) => {
      debounce(() => {
        if (!socketRef.current) return;
        socketRef.current.send(
          JSON.stringify({ type: "update", projectID, content })
        );
      }, 1500)();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectID]
  );

  /** 🔹 Sync Changes with WebSocket */
  const handleEditorChange = useCallback(
    (value?: string) => {
      if (value !== undefined && value !== modifiedContent) {
        setModifiedContent(value);
        saveContent(value);
      }
    },
    [modifiedContent, saveContent]
  );

  /** 🔹 Fetch Runtime Version */
  const fetchVersion = async () => {
    if (!language) return;
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/runtimes");
      const runtimes = await response.json();
      const runtime = runtimes.find((rt: { language: string; version: string }) => rt.language === language);
      setVersion(runtime ? runtime.version : "unknown");
    } catch (error) {
      console.error("Error fetching runtime version:", error);
      setVersion("error");
    }
  };

  /** 🔹 Run Code */
  const runCode = async () => {
    if (!language || !modifiedContent) return;
    try {
      setIsLoading(true);
      fetchVersion();
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          version,
          files: [{ name: "main", content: modifiedContent }],
        }),
      });
      const result = await response.json();
      setToggle("console");
      setAns(result.run);
    } catch (error) {
      console.error("Error running code with Piston API:", error);
    } finally {
      setIsLoading(false);
    }
  };


  /** 🔹 Store Editor Instance */
  const handleOnMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <div className="flex flex-col justify-between pb-[1vw] h-[100vh] w-full bg-[#020202] px-[1vw] items-center overflow-x-hidden">
      <div className="w-full px-[1vw] max-lg:m-[10px] h-[48px] flex flex-row justify-between items-center">
        <h1 className="lg:text-[2vw] text-[5vw] text-gray-400">CodeSync</h1>
        <Button onClick={runCode}>{isLoading ? "Running..." : "Run"}</Button>
      </div>

      <div className="flex max-lg:flex-col-reverse lg:h-[90vh] gap-[1vw] w-full justify-between">
        <Collaboration />
        <div className="lg:w-[75vw] lg:h-[90vh] rounded-xl bg-[#131313] flex flex-col">
          <div className="flex">
            <div className={`cursor-pointer flex rounded-tl-xl flex-row items-center justify-center gap-[10px] px-[1vw] py-[0.5vw] ${toggle === "editor" ? "bg-[#1E1E1E] text-white" : "text-gray-300"}`} onClick={() => setToggle("editor")}>
              <Code2 size={20} />
              Code
            </div>
            <div className={`cursor-pointer flex flex-row items-center justify-center gap-[10px] px-[1vw] py-[0.5vw] ${toggle === "console" ? "bg-[#1E1E1E] text-white" : "text-gray-300"}`} onClick={() => setToggle("console")}>
              <Terminal size={20} />
              Console
            </div>
          </div>
          <div className='lg:h-[85vh] h-[60vh]'>
            <div className={`${toggle === 'editor' ? 'block' : 'hidden'} h-full overflow-y-auto`}>
              <Editor
                onMount={handleOnMount}
                height='100%'
                theme='vs-dark'
                value={modifiedContent}
                language={language === 'c++' ? 'cpp' : language}
                onChange={handleEditorChange}
                options={{
                  tabSize: 2,
                  fontSize: 15,
                  minimap: { enabled: false },
                }}
              />
            </div>
            <div
              className={`console bg-[#1E1E1E] text-white px-[2vw] py-[1vw] h-full overflow-y-auto ${toggle === 'console' ? 'block' : 'hidden'
                }`}
            >
              <p className='text-red-400'>{ans?.stderr}</p>
              <p>{ans?.stdout}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonacoEditor;
