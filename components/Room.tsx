"use client";

import { ReactNode } from "react";
import {
    LiveblocksProvider,
    RoomProvider,
    ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { useEffect, useState } from "react";

export function Room({ children }: { children: ReactNode }) {
    const [projectID, setProjectID] = useState("");

    useEffect(() => {
        const path = window.location.pathname;
        const projectID = path.split('/').pop() || "";
        setProjectID(projectID);
    }, []);

    return (
        <LiveblocksProvider publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCK_API_KEY!}>
            <RoomProvider id={projectID || "room"}>
                <ClientSideSuspense fallback={<div>Loading…</div>}>
                    {children}
                </ClientSideSuspense>
            </RoomProvider>
        </LiveblocksProvider>
    );
}