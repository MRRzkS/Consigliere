"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ExternalLink, MoreHorizontal, Edit, Trash2, Calendar, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import { Project, useStore } from "@/store/useStore"
import { formatDistanceToNow, parseISO, isPast } from "date-fns"
import { EditProjectModal } from "./EditProjectModal"
import { DeleteAlert } from "./DeleteAlert"
import { createClient } from "@/utils/supabase/client"

interface ProjectCardProps {
    project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
    const { removeProject } = useStore()
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: project.id, data: { project } })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('projects')
                .delete()
                .eq('id', project.id)
                .select()

            if (error) throw error

            if (!data || data.length === 0) {
                throw new Error('No rows deleted. Check RLS policies.')
            }

            removeProject(project.id)
            setDeleteOpen(false)
        } catch (error: any) {
            console.error('Error deleting project:', error)
            alert(`Failed to delete project: ${error.message || error}`)
        } finally {
            setLoading(false)
        }
    }

    const deadlineDate = parseISO(project.deadline)
    const daysLeft = formatDistanceToNow(deadlineDate, { addSuffix: true })
    const isOverdue = isPast(deadlineDate)

    return (
        <>
            <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
                <Card className="bg-card/50 backdrop-blur-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group relative">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start pr-8">
                            <CardTitle className="text-base font-bold truncate" title={project.clientName}>
                                {project.clientName}
                            </CardTitle>
                        </div>
                        <div className="flex gap-2 mt-1">
                            {/* Placeholder badges - in a real app these might come from DB */}
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">Web</Badge>
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">App</Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="pb-2 space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-2 h-3 w-3" />
                            <span className={cn(isOverdue ? "text-destructive font-medium" : "")}>
                                {daysLeft}
                            </span>
                        </div>
                        <div className="flex items-center text-lg font-bold">
                            <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                            {new Intl.NumberFormat('id-ID', { style: 'decimal' }).format(project.value)}
                        </div>
                    </CardContent>

                    <CardFooter className="pt-2">
                        {project.previewLink && (
                            <a
                                href={project.previewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center"
                                onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on link click
                            >
                                <ExternalLink className="mr-1 h-3 w-3" />
                                View Preview
                            </a>
                        )}
                    </CardFooter>
                </Card>
            </div>

            <EditProjectModal
                project={project}
                open={editOpen}
                onOpenChange={setEditOpen}
            />

            <DeleteAlert
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={handleDelete}
                loading={loading}
            />
        </>
    )
}
