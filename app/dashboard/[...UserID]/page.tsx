'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import db from '@/appwrite/action';
import { ID } from 'appwrite';
import { usePathname, useRouter } from 'next/navigation';
import { Deletebtn } from '@/components/Deletebtn';
import { Project } from '@/types/global.type';

const Page = () => {
    const { isLoaded, user } = useUser();
    const router = useRouter();
    const [userproject, setUserProject] = useState<Project[]>([]);
    const [lang, setLang] = useState<string>('');
    const [modal, setModal] = useState(false);
    const path = usePathname();
    const userID = isLoaded ? path.split('/').pop() : null;
    const useremail = isLoaded && user ? user.primaryEmailAddress?.emailAddress : '';
    const [file, setfile] = useState('');

    const init = useCallback(async () => {
        try {

            const response = await db.projects.list();
            const filteredDocuments = response.documents.filter((doc: Project) => {
                return doc.ownerID === userID || (doc.collaborator_email && doc.collaborator_email.includes(useremail!));
            });
            setUserProject(filteredDocuments);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    }, [userID, useremail]);

    useEffect(() => {
        if (isLoaded && userID) {
            if (user?.id !== userID) {
                router.push('/error');
            }

            init();
        }
    });
    let width = 0;
    if (typeof window !== "undefined") {
        width = window.innerWidth;
    }
    

    const createHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setModal(false);
        const project_name = (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value;

        try {
            const payload = {
                projectID: ID.unique(),
                project_name,
                language: lang,
                ownerID: userID!,
                created_at: new Date().toISOString(),
            };
            const response = await db.projects.create(payload);
            setUserProject([...userproject, response]);
        } catch (err) {
            console.error("Error creating project:", err);
        }
    };

    const deleteHandler = async (projectId: string) => {
        try {
            await db.projects.delete(projectId);
            setUserProject(userproject.filter((project) => project.$id !== projectId));
        } catch (err) {
            console.error("Error deleting project:", err);
        }
    };

    const handleLanguageSelect = (value: string) => {
        setLang(value);
    };



    return (
        <div className='bg-white w-full text-black h-screen'>
            <div className='flex justify-between items-center px-5 lg:px-16 py-4'>
                <h1 className='text-2xl'>CodeSync</h1>
                {
                    width > 1024 && (
                        <div className='w-[60%] flex items-center gap-[10px] bg-gray-200 h-12 rounded-full'>
                            <Search className='ml-4 ' />
                            <Input
                                placeholder='Search'
                                className='w-[90%] shadow-none border-none focus:shadow-none'
                                onChange={(e) => setfile(e.target.value)}
                            />
                        </div>
                    )

                }
                <UserButton />
            </div>

            <div className={`flex flex-col items-center mt-20 ${modal ? 'pointer-events-none' : ''}`}>
                <div className='relative mx-auto w-full flex flex-col justify-center gap-[30px] items-center pointer-events-auto'>
                    {
                        width < 1024 && (
                            <div className='w-[90%] flex items-center gap-[10px] bg-gray-200 h-12 rounded-full'>
                                <Search className='ml-4 ' />
                                <Input
                                    placeholder='Search'
                                    className='w-[90%] shadow-none border-none focus:shadow-none'
                                    onChange={(e) => setfile(e.target.value)}
                                />
                            </div>
                        )
                    }
                    <Button onClick={() => setModal(true)}>Create Project</Button>

                    <Card className={`lg:w-[600px] w-[400px] absolute top-[-30px] mx-auto z-[10] ${modal ? 'block' : 'hidden'}`}>
                        <CardHeader>
                            <CardTitle>Create project</CardTitle>
                            <CardDescription>Deploy your new project in one-click.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={createHandler}>
                                <div className="grid w-full items-center gap-4">
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="name">Name</Label>
                                        <Input required id="name" name="name" placeholder="Name of your project" />
                                    </div>
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="framework">Framework</Label>
                                        <Select name='framework' onValueChange={handleLanguageSelect}>
                                            <SelectTrigger id="framework">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent position="popper">
                                                {[
                                                    { name: "c++" },
                                                    { name: "c" },
                                                    { name: "python" },
                                                    { name: "javascript" },
                                                    { name: "java" },
                                                    { name: "php" },
                                                    { name: "rust" },
                                                ].map((lang) => (
                                                    <SelectItem key={lang.name} value={lang.name}>
                                                        {lang.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex justify-between mt-4">
                                    <Button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setModal(false);
                                        }}
                                        variant="outline">Cancel
                                    </Button>
                                    <Button type='submit'>Create</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <Table className='lg:w-[80%] w-[90%] mx-auto mt-[6vw] lg:mt-[3vw]'>
                    <TableHeader>
                        <TableRow className='lg:text-[1.2vw] text-[3vw] hover:bg-white text-[#CDCDCD]'>
                            <TableHead className="lg:w-[50%]">Name</TableHead>
                            <TableHead>Language</TableHead>
                            <TableHead>Created at</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {userproject
                            .filter((project) => project.project_name.toLowerCase().includes(file.toLowerCase()))
                            .map((project, index) => (
                                <TableRow
                                    key={index}
                                    className={`h-[50px] cursor-pointer hover:bg-[#FAFAFA] ${index !== 0 ? 'border-t' : 'border-t-0'}`}>
                                    <TableCell
                                        className="font-medium"
                                        onClick={() => router.push(`/project/${project.$id}`)}
                                    >
                                        {project.project_name}
                                    </TableCell>
                                    <TableCell onClick={() => router.push(`/project/${project.$id}`)}>
                                        {project.language}
                                    </TableCell>
                                    <TableCell onClick={() => router.push(`/project/${project.$id}`)}>
                                        {new Date(project.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Deletebtn projectId={project.$id} onclick={deleteHandler} />
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default Page;