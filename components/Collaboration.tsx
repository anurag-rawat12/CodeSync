'use client';
import React, { useEffect, useMemo, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import db from '@/appwrite/action'
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const Collaboration = () => {

    const user = useUser();

    const path = usePathname();
    const projectID = useMemo(() => path?.split('/').pop(), [path]);
    const [email, setemail] = useState('');
    const [collaborators, setCollaborators] = useState<string[]>([]);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);


    useEffect(() => {
        if (user) {
            setUserEmail(user?.user?.primaryEmailAddress?.emailAddress ?? null);
        }
    }, [user])

    const addCollaborator = async () => {
        try {
            setLoadingAction('adding');
            const existingProject = await db.projects.get(projectID);
            const existingEmails = existingProject.collaborator_email || [];
            const updatedEmails = [...existingEmails, email];
            const payload = {
                collaborator_email: updatedEmails,
            };
            await db.projects.update(projectID, payload);

        } catch (err) {
            console.error("Error creating project:", err);
        }
        finally {
            setLoadingAction(null);
        }
    }

    const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setemail(e.target.value);
    }

    useEffect(() => {
        const getCollaborators = async () => {
            try {
                const existingProject = await db.projects.get(projectID);
                setCollaborators(existingProject.collaborator_email);

            } catch (err) {
                console.error("Error creating project:", err);
            }
        }
        getCollaborators();
    }, [projectID, loadingAction]);

    const removeCollaborator = async (email: string) => {
        try {
            const existingProject = await db.projects.get(projectID);
            const existingEmails = existingProject.collaborator_email || [];
            const updatedEmails = existingEmails.filter((e:string) => e !== email);
            const payload = {
                collaborator_email: updatedEmails,
            };
            await db.projects.update(projectID, payload);

        } catch (err) {
            console.error("Error creating project:", err);
        }
    }

    return (
        <div className='lg:w-[25vw] h-full rounded-xl text-white bg-[#1E1E1E]'>
            <div className='flex flex-col lg:h-[40vh] h-[30vh] items-center justify-center gap-[3vw]' >
                <h1 className='lg:text-[1.5vw] text-[5vw] text-gray-400' >Add collaborator to this project</h1>
                <Input
                    placeholder='Enter email'
                    onChange={changeHandler}
                    className='w-[90%] shadow-none border-gray-700 focus:shadow-none' />
                <Button
                    onClick={addCollaborator}
                >{
                        loadingAction === 'adding' ? 'Adding...' : 'Add'
                    }</Button>
            </div>

            <div className=''>
                {
                    collaborators
                        ?.filter(collaboratorEmail => collaboratorEmail !== userEmail)
                        .map((email, index) => (
                            <div key={index} className='flex items-center justify-between gap-[1vw] p-[1vw] border-b border-gray-700'>
                                <p>{email}</p>
                                <Button
                                    onClick={() => removeCollaborator(email)}
                                >Remove</Button>
                            </div>
                        ))
                }
            </div>
        </div>
    )
}

export default Collaboration