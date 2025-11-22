"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useStore, Client } from "@/store/useStore"
import { createClient } from "@/utils/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditClientModalProps {
    client: Client
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditClientModal({ client, open, onOpenChange }: EditClientModalProps) {
    const { updateClient } = useStore()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const [formData, setFormData] = useState({
        name: client.name,
        company: client.company || "",
        phone: client.phone,
        email: client.email || "",
        status: client.status,
        notes: client.notes || "",
    })

    useEffect(() => {
        setFormData({
            name: client.name,
            company: client.company || "",
            phone: client.phone,
            email: client.email || "",
            status: client.status,
            notes: client.notes || "",
        })
    }, [client])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await supabase
                .from('clients')
                .update({
                    name: formData.name,
                    company: formData.company,
                    phone: formData.phone,
                    email: formData.email,
                    status: formData.status,
                    notes: formData.notes,
                })
                .eq('id', client.id)
                .select()

            if (error) throw error

            if (!data || data.length === 0) {
                throw new Error('No rows updated. Check RLS policies.')
            }

            updateClient({
                ...client,
                name: formData.name,
                company: formData.company,
                phone: formData.phone,
                email: formData.email,
                status: formData.status as 'Active' | 'Prospect',
                notes: formData.notes,
            })
            onOpenChange(false)
        } catch (error: any) {
            console.error('Error updating client:', error)
            alert(`Failed to update client: ${error.message || error}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Client</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-company" className="text-right">
                            Company
                        </Label>
                        <Input
                            id="edit-company"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-phone" className="text-right">
                            Phone
                        </Label>
                        <Input
                            id="edit-phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="col-span-3"
                            placeholder="e.g. 0812..."
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="edit-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-status" className="text-right">
                            Status
                        </Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value as 'Active' | 'Prospect' })}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Prospect">Prospect</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-notes" className="text-right">
                            Notes
                        </Label>
                        <Textarea
                            id="edit-notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="col-span-3"
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
