"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/store/useStore"
import { supabase } from "@/lib/supabaseClient"
import { Plus } from "lucide-react"

export function NewAssetModal() {
    const { addAsset } = useStore()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        type: "Prompt",
        content: "",
        language: "plaintext",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await supabase
                .from('armory')
                .insert([
                    {
                        title: formData.title,
                        type: formData.type,
                        content: formData.content,
                        language: formData.language,
                    },
                ])
                .select()

            if (error) throw error

            if (data) {
                const newAsset = {
                    id: data[0].id,
                    title: data[0].title,
                    type: data[0].type as 'Prompt' | 'Component',
                    content: data[0].content,
                    language: data[0].language,
                }
                addAsset(newAsset)
                setOpen(false)
                setFormData({
                    title: "",
                    type: "Prompt",
                    content: "",
                    language: "plaintext",
                })
            }
        } catch (error) {
            console.error('Error adding asset:', error)
            alert('Failed to add asset')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Add Weapon
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add New Weapon</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="col-span-3"
                            placeholder="e.g. Navbar Responsive"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Type
                        </Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Prompt">Prompt</SelectItem>
                                <SelectItem value="Component">Component</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {formData.type === 'Component' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="language" className="text-right">
                                Language
                            </Label>
                            <Select
                                value={formData.language}
                                onValueChange={(value) => setFormData({ ...formData, language: value })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="typescript">TypeScript</SelectItem>
                                    <SelectItem value="javascript">JavaScript</SelectItem>
                                    <SelectItem value="css">CSS</SelectItem>
                                    <SelectItem value="html">HTML</SelectItem>
                                    <SelectItem value="plaintext">Plain Text</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="content" className="text-right pt-2">
                            Content
                        </Label>
                        <Textarea
                            id="content"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="col-span-3 min-h-[200px] font-mono text-sm"
                            placeholder="Paste your code or prompt here..."
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Forging..." : "Forge Weapon"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
