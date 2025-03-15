'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Button } from './ui/button';
import { Code2, Terminal } from 'lucide-react';
import { usePathname } from 'next/navigation';
import db from '@/appwrite/action';
import * as Y from 'yjs';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
import { editor } from 'monaco-editor';
import { MonacoBinding } from 'y-monaco';
import { Awareness } from 'y-protocols/awareness';
import Collaboration from './Collaboration';

const MonacoEditor = () => {
    const path = usePathname();
    const projectID = useMemo(() => path?.split('/').pop(), [path]);
    const [editorInstance, setEditorInstance] = useState<editor.IStandaloneCodeEditor | null>(null);
    const [modifiedContent, setModifiedContent] = useState<string>('');
    const [externalContent, setExternalContent] = useState<string>('');
    const [language, setLanguage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [ans, setAns] = useState<{ stdout: string; stderr: string; output: string } | null>(null);
    const [toggle, setToggle] = useState<'editor' | 'console'>('editor');
    const [version, setVersion] = useState('loading...');

    const yDocRef = useRef<Y.Doc | null>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);
    const yProviderRef = useRef<LiveblocksYjsProvider | null>(null);

    const init = async () => {
        try {
            const res = await db.projects.get(projectID);
            if (res) {
                setExternalContent(res.content);
                setModifiedContent(res.content);
                setLanguage(res.language);
            } else {
                console.error('No content available in response');
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        }
    };

    useEffect(() => {
        init();
    }, [projectID]);

    useEffect(() => {
        if (editorInstance && yDocRef.current) {
            if (bindingRef.current) {
                bindingRef.current.destroy();
                bindingRef.current = null;
            }

            const yText = yDocRef.current.getText('monaco');
            yDocRef.current.transact(() => {
                yText.delete(0, yText.length);
                yText.insert(0, externalContent || '');
            });

            const newBinding = new MonacoBinding(
                yText,
                editorInstance.getModel() as editor.ITextModel,
                new Set([editorInstance]),
                yProviderRef.current?.awareness as unknown as Awareness
            );
            bindingRef.current = newBinding;
        } else if (editorInstance) {
            const model = editorInstance.getModel();
            if (model) {
                model.setValue(externalContent);
            }
        }
    }, [externalContent, editorInstance]);

    const fetchVersion = async () => {
        if (!language) return;
        try {
            const response = await fetch('https://emkc.org/api/v2/piston/runtimes');
            const runtimes = await response.json();
            const runtime = runtimes.find((rt: { language: string; version: string }) => rt.language === language);
            setVersion(runtime ? runtime.version : 'unknown');
        } catch (error) {
            console.error('Error fetching runtime version:', error);
            setVersion('error');
        }
    };

    const runCode = async () => {
        if (!language || !modifiedContent) return;
        try {
            setIsLoading(true);
            fetchVersion();
            const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
        } finally {
            setIsLoading(false);
        }
    };

    const saveCode = async () => {
        try {
            await db.projects.update(projectID, { content: modifiedContent });
        } catch (error) {
            console.error(error);
        }
    };

    const handleOnMount: OnMount = (editor) => {
        setEditorInstance(editor);
    };

    const handleEditorChange = useCallback((value?: string) => {
        setModifiedContent(value || '');
    }, []);

    useEffect(() => {
        if (editorInstance) {
            editorInstance.layout();
        }
    }, [toggle, editorInstance]);

    return (
        <div className='flex flex-col justify-between pb-[1vw] h-[100vh] w-full bg-[#020202] px-[1vw] items-center overflow-x-hidden'>
            <div className='w-full px-[1vw] max-lg:m-[10px] h-[48px] flex flex-row justify-between items-center'>
                <h1 className='lg:text-[2vw] text-[5vw] text-gray-400'>CodeSync</h1>
                <Button onClick={runCode}>{isLoading ? 'running...' : 'Run'}</Button>
                <Button onClick={saveCode} className='bg-green-500 hover:bg-green-600'>Save</Button>
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
                                defaultValue=''
                                // Do not pass the controlled "value" prop; let the Yjs binding manage content.
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
