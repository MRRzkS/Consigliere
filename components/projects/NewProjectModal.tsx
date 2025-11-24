"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/store/useStore"
import { createClient } from "@/utils/supabase/client"

export function NewProjectModal() {
    const { addProject } = useStore()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const [formData, setFormData] = useState({
        clientName: "",
        deadline: "",
        value: "",
        previewLink: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await supabase
                .from('projects')
                .insert([
                    {
                        title: formData.clientName,
                        deadline: formData.deadline,
                        price: parseInt(formData.value),
                        status: 'Negotiation',
                        // preview_link: formData.previewLink || null,
                    },
                ])
                .select()

            if (error) throw error

            if (data) {
                // Map Supabase data to store format
                const newProject = {
                    id: data[0].id,
                    clientName: data[0].title,
                    deadline: data[0].deadline,
                    value: data[0].price,
                    status: data[0].status as any,
                    previewLink: undefined,
                }
                addProject(newProject)
                setOpen(false)
                setFormData({ clientName: "", deadline: "", value: "", previewLink: "" })
            }
        } catch (error) {
            console.error('Error adding project:', error)
            alert('Failed to add project')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>New Project</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Project</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new project below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="clientName" className="text-right">
                            Client
                        </Label>
                        <Input
                            id="clientName"
                            value={formData.clientName}
                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="deadline" className="text-right">
                            Deadline
                        </Label>
                        <Input
                            id="deadline"
                            type="date"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="value" className="text-right">
                            Value (IDR)
                        </Label>
                        <Input
                            id="value"
                            type="number"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="previewLink" className="text-right">
                            Link
                        </Label>
                        <Input
                            id="previewLink"
                            value={formData.previewLink}
                            onChange={(e) => setFormData({ ...formData, previewLink: e.target.value })}
                            className="col-span-3"
                            placeholder="Optional"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
