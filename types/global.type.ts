

export interface Project {
    $id: string;
    project_name: string;
    language: string;
    ownerID: string;
    created_at: string;
    collaborator_email?: string[];
}
