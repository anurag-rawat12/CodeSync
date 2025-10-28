"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { dbAction } from "@/appwrite/action"; // server-safe
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

/* eslint-disable @typescript-eslint/no-explicit-any */
type ProjectType = {
  collaborator_email?: string[];
  [key: string]: any;
};

const Collaboration: React.FC = () => {
  const { user } = useUser();
  const path = usePathname();
  const projectID = useMemo(() => path?.split("/").pop(), [path]);

  const [email, setEmail] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  /** Set logged-in user email */
  useEffect(() => {
    if (user) {
      setUserEmail(user.primaryEmailAddress?.emailAddress ?? null);
    }
  }, [user]);

  /**Fetch collaborators */
  const fetchCollaborators = async () => {
    if (!projectID) return;
    try {
      const project = (await dbAction("get", undefined, projectID)) as ProjectType;
      setCollaborators(project.collaborator_email || []);
    } catch (err) {
      console.error("Error fetching collaborators:", err);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, [projectID, loadingAction]);

  /**Add collaborator */
  const addCollaborator = async () => {
    if (!projectID || !email) return;
    try {
      setLoadingAction("adding");

      const project = (await dbAction("get", undefined, projectID)) as ProjectType;
      const existingEmails = project.collaborator_email || [];
      const updatedEmails = [...existingEmails, email];

      await dbAction("update", { collaborator_email: updatedEmails }, projectID);
      setEmail(""); // clear input
    } catch (err) {
      console.error("Error adding collaborator:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  /**Remove collaborator */
  const removeCollaborator = async (removeEmail: string) => {
    if (!projectID) return;
    try {
      const project = (await dbAction("get", undefined, projectID)) as ProjectType;
      const existingEmails = project.collaborator_email || [];
      const updatedEmails = existingEmails.filter((e) => e !== removeEmail);

      await dbAction("update", { collaborator_email: updatedEmails }, projectID);
    } catch (err) {
      console.error("Error removing collaborator:", err);
    }
  };

  return (
    <div className="lg:w-[25vw] h-full rounded-xl text-white bg-[#1E1E1E]">
      <div className="flex flex-col lg:h-[40vh] h-[30vh] items-center justify-center gap-[3vw]">
        <h1 className="lg:text-[1.5vw] text-[5vw] text-gray-400">
          Add collaborator to this project
        </h1>
        <Input
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-[90%] shadow-none border-gray-700 focus:shadow-none"
        />
        <Button onClick={addCollaborator}>
          {loadingAction === "adding" ? "Adding..." : "Add"}
        </Button>
      </div>

      <div>
        {collaborators
          ?.filter((collaboratorEmail) => collaboratorEmail !== userEmail)
          .map((email, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-[1vw] p-[1vw] border-b border-gray-700"
            >
              <p>{email}</p>
              <Button onClick={() => removeCollaborator(email)}>Remove</Button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Collaboration;
