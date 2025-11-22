"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Project, ProjectStatus } from "@/store/useStore"
import { ProjectCard } from "./ProjectCard"
import { cn } from "@/lib/utils"

interface KanbanColumnProps {
    id: ProjectStatus
    title: string
    projects: Project[]
}

export function KanbanColumn({ id, title, projects }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
    })

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{title}</h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {projects.length}
                </span>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 bg-muted/30 rounded-lg p-2 min-h-[500px] space-y-3 transition-colors",
                    // "hover:bg-muted/50" // Optional hover effect for column
                )}
            >
                <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </SortableContext>

                {projects.length === 0 && (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic opacity-50 min-h-[100px]">
                        No projects
                    </div>
                )}
            </div>
        </div>
    )
}
