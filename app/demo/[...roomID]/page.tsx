'use client';

import EditorPage from '@/components/Editor';
import React, { useEffect, useRef, useState } from 'react';
import Client from '@/components/client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { initSocket } from '@/app/socket';
import { Socket } from 'socket.io-client';
import ACTIONS from '@/lib/action';

interface ClientType {
  socketID: string;
  username: string;
}

const RoomPage = () => {

  const socketRef = useRef<Socket | null>(null);

  const params = useParams();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");

  const roomID = params.roomID as string;
  const router = useRouter();
  const [ClientList, setClientList] = useState<ClientType[]>([]);
  const codeRef = useRef<string>(null)

  useEffect(() => {
    if (socketRef.current) return;
    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        toast.error('Socket connection failed. Please try again.');
        router.push('/');
      });

      socketRef.current.on('connect_failed', (err) => {
        console.error('Socket connection failed:', err);
        toast.error('Socket connection failed. Please try again.');
        router.push('/');
      });

      socketRef.current.emit(ACTIONS.JOIN, {
        roomID,
        username: name,
      });


      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketID }) => {
        if (username !== name) {
          toast.success(`${username} joined the room.`);
        }
        setClientList(clients);
        socketRef.current?.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current,
          socketID,
        });
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketID, username }) => {
        if (username !== name) {
          toast.success(`${username} left the room.`);
        }
        setClientList((prev) => prev.filter((client) => client.socketID !== socketID));
      });
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      }
    }

  }, []);



  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomID);
      toast.success('Room ID copied!');
    } catch {
      toast.error('Failed to copy Room ID');
    }
  };

  const handleLeave = () => {
    toast('You have left the room.');
    router.push('/demo')
  };

  return (
    <div className="flex min-h-screen bg-[#0B0B0B] text-white font-inter">
      {/* Sidebar */}
      <aside className="w-[280px] border-r border-white/10 bg-[#111111] flex flex-col justify-between p-6">
        {/* Header */}
        <div>
          <div className="text-2xl font-bold text-white mb-8">
            CodeSync
          </div>

          <div>
            <h3 className="uppercase text-sm text-gray-400 tracking-wide mb-3">
              Connected
            </h3>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[50vh]">
              {ClientList.map((client) => (
                <motion.div
                  key={client.socketID}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Client username={client.username} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-8">
          <Button
            onClick={handleCopy}
            className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:opacity-90 text-white text-[15px] py-2.5 rounded-lg transition-all"
          >
            Copy Room ID
          </Button>

          <Button
            onClick={handleLeave}
            className="w-full bg-[#EF4444]/90 hover:bg-[#DC2626] text-white text-[15px] py-2.5 rounded-lg transition-all"
          >
            Leave Room
          </Button>
        </div>
      </aside>

      {/* Main Editor */}
      <main className="bg-[#0B0B0B] overflow-hidden">
        <EditorPage
          onCodeChange={(code) => {
            codeRef.current = code
          }} roomID={roomID} socketRef={socketRef} />
          
      </main>
    </div>
  );
};

export default RoomPage;
