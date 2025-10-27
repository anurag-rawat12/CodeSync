'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Trash2, Plus } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { dbAction } from '@/appwrite/action';
import { ID } from 'appwrite';
import { usePathname, useRouter } from 'next/navigation';
import { Deletebtn } from '@/components/Deletebtn';
import { Project } from '@/types/global.type';

const Page = () => {
  const { user } = useUser();
  const router = useRouter();
  const path = usePathname();
  const projectID = useMemo(() => path?.split("/").pop(), [path]);

  const [userproject, setUserProject] = useState<Project[]>([]);
  const [lang, setLang] = useState('');
  const [modal, setModal] = useState(false);
  const [collabModal, setCollabModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [email, setEmail] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  /** 🔹 Set logged-in user email */
  useEffect(() => {
    if (user) setUserEmail(user.primaryEmailAddress?.emailAddress ?? null);
  }, [user]);

  /** 🔹 Fetch collaborators */
  const fetchCollaborators = async () => {
    if (!selectedProject) return;
    try {
      const project = (await dbAction("get", undefined, selectedProject.$id)) as Project;
      setCollaborators(project.collaborator_email || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, [selectedProject, loadingAction]);

  /** 🔹 Add collaborator */
  const addCollaborator = async () => {
    if (!selectedProject || !email) return;
    if (collaborators.includes(email)) return alert("Collaborator already added.");
    try {
      setLoadingAction("adding");
      const updated = [...collaborators, email];
      await dbAction("update", { collaborator_email: updated }, selectedProject.$id);
      setEmail("");
      setCollaborators(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  /** 🔹 Remove collaborator */
  const removeCollaborator = async (removeEmail: string) => {
    if (!selectedProject) return;
    try {
      setLoadingAction("removing");
      const updated = collaborators.filter((e) => e !== removeEmail);
      await dbAction("update", { collaborator_email: updated }, selectedProject.$id);
      setCollaborators(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  /** 🔹 Load projects */
  const init = useCallback(async () => {
    try {
      const response = await dbAction("list") as { documents: Project[] };
      const filtered = response.documents.filter(
        (doc) => doc.ownerID === user?.id || doc.collaborator_email?.includes(userEmail || '')
      );
      setUserProject(filtered);
    } catch (err) {
      console.error(err);
    }
  }, [user?.id, userEmail]);

  useEffect(() => {
    if (user && userEmail !== null) init();
  }, [init, user, userEmail]);

  /** 🔹 Create Project */
  const createHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModal(false);
    const name = (e.currentTarget.elements.namedItem("name") as HTMLInputElement).value;
    
    if (!user?.id) {
      console.error("User ID is required to create a project");
      return;
    }
    
    try {
      const payload = {
        projectID: ID.unique(),
        project_name: name,
        language: lang,
        ownerID: user.id,
        created_at: new Date().toISOString(),
      };
      const response = await dbAction("create", payload) as Project;
      setUserProject([...userproject, response]);
    } catch (err) {
      console.error(err);
    }
  };

  /** 🔹 Delete Project */
  const deleteHandler = async (projectId: string) => {
    try {
      await dbAction("delete", undefined, projectId);
      setUserProject(userproject.filter((p) => p.$id !== projectId));
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="min-h-screen w-full bg-[#262624] text-[#EAEAEA]">
      {/* Navbar */}
      <div className="border-b border-[#3A3A38] bg-[#262624]/95 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">CodeSync</h1>
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A96]" />
              <Input
                placeholder="Search projects..."
                className="w-full bg-[#2E2E2C] border-[#3A3A38] text-[#EAEAEA] pl-10 h-9 text-sm focus-visible:ring-1 focus-visible:ring-[#EAEAEA]/10 placeholder:text-[#9A9A96]"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold mb-1">Projects</h2>
            <p className="text-sm text-[#9A9A96]">Manage your coding projects</p>
          </div>
          <Button
            onClick={() => setModal(true)}
            className="bg-[#EAEAEA] text-[#1A1A1A] hover:bg-[#EAEAEA]/90 h-9 px-4 text-sm font-medium"
          >
            <Plus size={16} className="mr-1.5" />
            New Project
          </Button>
        </div>

        <div className="border border-[#3A3A38] rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[#3A3A38] hover:bg-[#30302E]/50 transition">
                {['Name', 'Language', 'Created', 'Actions'].map((head) => (
                  <TableHead key={head} className="text-[#9A9A96] font-medium text-xs h-11">
                    {head}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {userproject
                .filter((p) => p.project_name.toLowerCase().includes(search.toLowerCase()))
                .map((project) => (
                  <TableRow key={project.$id} className="border-[#3A3A38] hover:bg-[#30302E]/50 transition">
                    <TableCell
                      className="font-medium cursor-pointer"
                      onClick={() => router.push(`/project/${project.$id}`)}
                    >
                      {project.project_name}
                    </TableCell>
                    <TableCell className="text-[#C7C7C4] text-sm capitalize">{project.language}</TableCell>
                    <TableCell className="text-[#C7C7C4] text-sm">
                      {new Date(project.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-[#30302E] text-[#9A9A96] hover:text-white"
                          onClick={() => {
                            setSelectedProject(project);
                            setCollabModal(true);
                          }}
                        >
                          <UserPlus size={16} />
                        </Button>
                        <Deletebtn projectId={project.$id} onclick={deleteHandler} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {userproject.filter((p) => p.project_name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
            <div className="py-16 text-center border-t border-[#3A3A38]">
              <p className="text-[#9A9A96] text-sm">No projects yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <Card className="bg-[#262624] border-[#3A3A38] w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-semibold">Create Project</CardTitle>
              <CardDescription className="text-[#9A9A96] text-sm">Start a new project</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createHandler} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#EAEAEA] text-sm font-medium">Name</Label>
                  <Input 
                    name="name" 
                    placeholder="My Project" 
                    required 
                    className="bg-[#2E2E2C] border-[#3A3A38] text-[#EAEAEA] h-9 text-sm focus-visible:ring-1 focus-visible:ring-[#EAEAEA]/10 placeholder:text-[#9A9A96]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#EAEAEA] text-sm font-medium">Language</Label>
                  <Select onValueChange={(v) => setLang(v)}>
                    <SelectTrigger className="bg-[#2E2E2C] border-[#3A3A38] text-[#EAEAEA] h-9 text-sm focus:ring-1 focus:ring-[#EAEAEA]/10">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2E2E2C] border-[#3A3A38]">
                      {['javascript', 'python', 'cpp', 'java', 'rust'].map((l) => (
                        <SelectItem 
                          key={l} 
                          value={l}
                          className="text-[#EAEAEA] focus:bg-[#30302E] focus:text-white capitalize text-sm"
                        >
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setModal(false)}
                    className="bg-transparent border-[#3A3A38] text-[#EAEAEA] hover:bg-[#30302E] h-9 text-sm"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-[#EAEAEA] text-[#1A1A1A] hover:bg-[#EAEAEA]/90 h-9 text-sm font-medium"
                  >
                    Create
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Collaborator Modal */}
      {collabModal && selectedProject && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <Card className="bg-[#262624] border-[#3A3A38] w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-semibold">Collaborators</CardTitle>
              <CardDescription className="text-[#9A9A96] text-sm">
                Manage access for {selectedProject.project_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="flex-1 bg-[#2E2E2C] border-[#3A3A38] text-[#EAEAEA] h-9 text-sm focus-visible:ring-1 focus-visible:ring-[#EAEAEA]/10 placeholder:text-[#9A9A96]"
                />
                <Button 
                  onClick={addCollaborator} 
                  disabled={loadingAction === "adding"}
                  className="bg-[#EAEAEA] text-[#1A1A1A] hover:bg-[#EAEAEA]/90 h-9 px-4 text-sm font-medium"
                >
                  {loadingAction === "adding" ? "Adding..." : "Add"}
                </Button>
              </div>

              {collaborators.length > 0 ? (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {collaborators.map((collab, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-[#2E2E2C] px-3 py-2.5 rounded-md group"
                    >
                      <span className="text-[#EAEAEA] text-sm">{collab}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeCollaborator(collab)}
                        className="h-7 w-7 hover:bg-[#30302E] text-[#9A9A96] hover:text-white opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-[#3A3A38] rounded-md">
                  <p className="text-[#9A9A96] text-sm">No collaborators yet</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setCollabModal(false)}
                  className="bg-transparent border-[#3A3A38] text-[#EAEAEA] hover:bg-[#30302E] h-9 text-sm"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Page;
