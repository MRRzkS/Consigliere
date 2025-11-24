"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore, Project } from "@/store/useStore"
import { createClient } from "@/utils/supabase/client"

interface EditProjectModalProps {
    project: Project
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditProjectModal({ project, open, onOpenChange }: EditProjectModalProps) {
    const { updateProject } = useStore()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const [formData, setFormData] = useState({
        clientName: project.clientName,
        deadline: project.deadline,
        value: project.value.toString(),
        previewLink: project.previewLink || "",
    })

    useEffect(() => {
        setFormData({
            clientName: project.clientName,
            deadline: project.deadline,
            value: project.value.toString(),
            previewLink: project.previewLink || "",
        })
    }, [project])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await supabase
                .from('projects')
                .update({
                    title: formData.clientName,
                    deadline: formData.deadline,
                    price: parseInt(formData.value),
                    preview_link: formData.previewLink || null,
                })
                .eq('id', project.id)
                .select()

            if (error) throw error

            if (!data || data.length === 0) {
                throw new Error('No rows updated. Check RLS policies.')
            }

            updateProject({
                ...project,
                clientName: formData.clientName,
                deadline: formData.deadline,
                value: parseInt(formData.value),
                previewLink: formData.previewLink || undefined,
            })
            onOpenChange(false)
        } catch (error: any) {
            console.error('Error updating project:', error)
            alert(`Failed to update project: ${error.message || error}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                    <DialogDescription>
                        Update the project details below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-clientName" className="text-right">
                            Client
                        </Label>
                        <Input
                            id="edit-clientName"
                            value={formData.clientName}
                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-deadline" className="text-right">
                            Deadline
                        </Label>
                        <Input
                            id="edit-deadline"
                            type="date"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-value" className="text-right">
                            Value (IDR)
                        </Label>
                        <Input
                            id="edit-value"
                            type="number"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-previewLink" className="text-right">
                            Link
                        </Label>
                        <Input
                            id="edit-previewLink"
                            value={formData.previewLink}
                            onChange={(e) => setFormData({ ...formData, previewLink: e.target.value })}
                            className="col-span-3"
                            placeholder="Optional"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
