'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Button } from './ui/button';
import { Code2, Terminal } from 'lucide-react';
import { usePathname } from 'next/navigation';
import db from '@/appwrite/action';
import * as Y from 'yjs';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
import { useRoom } from '@liveblocks/react/suspense';
import { editor } from 'monaco-editor';
import { MonacoBinding } from 'y-monaco';
import { Awareness } from 'y-protocols/awareness';
import Collaboration from './Collaboration';

const MonacoEditor = () => {
    const path = usePathname();
    const projectID = useMemo(() => path?.split('/').pop(), [path]);
    const room = useRoom();
    const [editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor | null>(null);
    const [modifiedContent, setModifiedContent] = useState<string>('');
    const [version, setVersion] = useState('loading...');
    const [ans, setAns] = useState<{ stdout: string; stderr: string; output: string } | null>(null);
    const [toggle, setToggle] = useState<'editor' | 'console'>('editor');
    const [language, setlanguage] = useState('');
    const [isloading, setisloading] = useState(false);

    const init = useCallback(async () => {
        try {
            const res = await db.projects.get(projectID);
            if (res) {
                setModifiedContent(res.content);
                setlanguage(res.language);
            } else {
                console.error('No content available in response');
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        }
    }, [projectID]);

    const initializeEditor = useCallback(() => {
        init();

        let yProvider: LiveblocksYjsProvider | null = null;
        let yDoc: Y.Doc | null = null;

        if (editorRef) {
            yDoc = new Y.Doc();
            const yText = yDoc.getText('monaco');
            yProvider = new LiveblocksYjsProvider(room, yDoc);

            new MonacoBinding(
                yText,
                editorRef.getModel() as editor.ITextModel,
                new Set([editorRef]),
                yProvider.awareness as unknown as Awareness
            );

            yProvider.connect();
        }

        return () => {
            try {
                if (yProvider) yProvider.destroy();
                if (yDoc) yDoc.destroy();
            } catch (error) {
                console.error('Error during cleanup:', error);
            }
        };
    }, [editorRef, room, init]);

    useEffect(() => {
        const cleanup = initializeEditor();
        return cleanup;
    }, [initializeEditor]);

    type Runtime = {
        language: string;
        version: string;
    };

    const fetchVersion = async () => {
        if (!language) return;
        try {
            const response = await fetch('https://emkc.org/api/v2/piston/runtimes');
            const runtimes = await response.json();
            const runtime = runtimes.find((runtime: Runtime) => runtime.language === language);
            setVersion(runtime ? runtime.version : 'unknown');

        } catch (error) {
            console.error('Error fetching runtime version:', error);
            setVersion('error');
        }
    };

    const runCode = async () => {
        if (!language || !modifiedContent) return;

        try {
            setisloading(true);
            fetchVersion();
            const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language,
                    version,
                    files: [{ name: 'main', content: modifiedContent }],
                }),
            });


            const result = await response.json();
            setToggle('console');
            setAns(result.run);
        } catch (error) {
            console.error('Error running code with Piston API:', error);
        }
        finally {
            setisloading(false);
        }
    };

    const saveCode = async () => {
        try {
            await db.projects.update(projectID, {
                content: modifiedContent,
            });
        }
        catch (error) {
            console.error(error);
        }
    }

    const handleOnMount: OnMount = useCallback((editor) => {
        setEditorRef(editor);
    }, []);

    const handleEditorChange = useCallback((value?: string) => {
        setModifiedContent(value || '');
    }, []);

    useEffect(() => {
        if (editorRef) {
            editorRef.layout();
        }
    }, [toggle, editorRef]);

    return (
        <div className='flex flex-col justify-between pb-[1vw] h-[100vh] w-full bg-[#020202] px-[1vw] items-center overflow-x-hidden'>
            <div className='w-full px-[1vw] max-lg:m-[10px] h-[48px] flex flex-row justify-between items-center'>
                <h1
                    className='lg:text-[2vw] text-[5vw] text-gray-400'
                >CodeSync</h1>
                <Button onClick={runCode}>{
                    isloading ? 'running...' : 'Run'
                }</Button>
                <Button
                    onClick={saveCode}
                    className="bg-green-500 hover:bg-green-600 ">Save</Button>
            </div>

            <div className='flex max-lg:flex-col-reverse lg:h-[90vh] gap-[1vw] w-full justify-between'>

                <Collaboration />

                <div className='lg:w-[75vw] lg:h-[90vh] rounded-xl bg-[#131313] flex flex-col'>

                    <div className='flex'>
                        <div
                            className={`cursor-pointer flex rounded-tl-xl flex-row items-center justify-center gap-[10px] px-[1vw] py-[0.5vw] ${toggle === 'editor' ? 'bg-[#1E1E1E] text-white' : 'text-gray-300'
                                }`}
                            onClick={() => setToggle('editor')}
                        >
                            <Code2 size={20} />
                            Code
                        </div>
                        <div
                            className={`cursor-pointer flex flex-row items-center justify-center gap-[10px] px-[1vw] py-[0.5vw] ${toggle === 'console' ? 'bg-[#1E1E1E] text-white' : 'text-gray-300'
                                }`}
                            onClick={() => setToggle('console')}
                        >
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
                                defaultValue={modifiedContent}
                                language={language == 'c++' ? 'cpp' : language}
                                onChange={handleEditorChange}
                                options={{
                                    tabSize: 2,
                                    fontSize: 15,
                                    minimap: { enabled: false },
                                }}
                            />
                        </div>
                        <div className={`console bg-[#1E1E1E] text-white px-[2vw] py-[1vw] h-full overflow-y-auto ${toggle === 'console' ? 'block' : 'hidden'}`}>
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
