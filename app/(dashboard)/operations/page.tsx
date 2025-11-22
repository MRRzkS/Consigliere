"use client"

import { useEffect, useState } from "react"
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { useStore, ProjectStatus, Project } from "@/store/useStore"
import { NewProjectModal } from "@/components/projects/NewProjectModal"
import { KanbanColumn } from "@/components/projects/KanbanColumn"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { createClient } from "@/utils/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"

export default function OperationsPage() {
    const { projects, setProjects, updateProjectStatus } = useStore()
    const [loading, setLoading] = useState(true)
    const [activeId, setActiveId] = useState<string | null>(null)
    const supabase = createClient()

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Enable click on buttons inside card
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        const fetchProjects = async () => {
            const { data, error } = await supabase
                .from('projects')
                .select('*')

            if (data) {
                const mappedProjects = data.map((p: any) => ({
                    id: p.id,
                    clientName: p.title,
                    deadline: p.deadline,
                    value: p.price,
                    status: p.status as ProjectStatus,
                    previewLink: p.preview_link || undefined,
                }))
                setProjects(mappedProjects)
            }
            setLoading(false)
        }

        fetchProjects()
    }, [setProjects])

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (!over) {
            setActiveId(null)
            return
        }

        const activeId = active.id as string
        const overId = over.id as string

        // Find the project being dragged
        const project = projects.find(p => p.id === activeId)
        if (!project) return

        // Find the container (column) we dropped into
        // If over.id is a container id (status), use that
        // If over.id is a project id, find that project's status
        let newStatus: ProjectStatus | undefined

        if (['Negotiation', 'In Development', 'Deployed'].includes(overId)) {
            newStatus = overId as ProjectStatus
        } else {
            const overProject = projects.find(p => p.id === overId)
            if (overProject) {
                newStatus = overProject.status
            }
        }

        if (newStatus && newStatus !== project.status) {
            // Optimistic UI Update
            updateProjectStatus(activeId, newStatus)

            // Supabase Update
            try {
                await supabase
                    .from('projects')
                    .update({ status: newStatus })
                    .eq('id', activeId)
            } catch (error) {
                console.error("Failed to update status in Supabase", error)
                // Revert would go here in a more robust app
            }
        }

        setActiveId(null)
    }

    const columns: ProjectStatus[] = ['Negotiation', 'In Development', 'Deployed']

    const activeProject = activeId ? projects.find(p => p.id === activeId) : null

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <h1 className="text-3xl font-bold tracking-tight">Operations</h1>
                <NewProjectModal />
            </div>

            {loading ? (
                <div className="grid gap-6 md:grid-cols-3 h-full">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-[200px] w-full" />
                            <Skeleton className="h-[200px] w-full" />
                        </div>
                    ))}
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                        <KanbanColumn
                            title="Negotiation"
                            id="Negotiation"
                            projects={projects.filter((p) => p.status === "Negotiation")}
                        />
                        <KanbanColumn
                            title="In Development"
                            id="In Development"
                            projects={projects.filter((p) => p.status === "In Development")}
                        />
                        <KanbanColumn
                            title="Deployed"
                            id="Deployed"
                            projects={projects.filter((p) => p.status === "Deployed")}
                        />
                    </div>
                    <DragOverlay>
                        {activeProject ? <ProjectCard project={activeProject} /> : null}
                    </DragOverlay>
                </DndContext>
            )}
        </div>
    )
}
