"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, Phone, Mail, Trash2, Edit } from "lucide-react"
import { Client, useStore } from "@/store/useStore"
import { formatPhoneNumber } from "@/lib/formatPhoneNumber"
import { createClient } from "@/utils/supabase/client"
import { useState } from "react"

import { EditClientModal } from "./EditClientModal"

interface ClientCardProps {
    client: Client
}

export function ClientCard({ client }: ClientCardProps) {
    const { removeClient } = useStore()
    const [loading, setLoading] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const supabase = createClient()

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this client?")) return
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('clients')
                .delete()
                .eq('id', client.id)
                .select()

            if (error) throw error

            if (!data || data.length === 0) {
                throw new Error('No rows deleted. Check RLS policies.')
            }

            removeClient(client.id)
        } catch (error: any) {
            console.error('Error deleting client:', error)
            alert(`Failed to delete client: ${error.message || error}`)
        } finally {
            setLoading(false)
        }
    }

    const whatsappLink = `https://wa.me/${formatPhoneNumber(client.phone)}`

    return (
        <>
            <Card className="hover:shadow-md transition-shadow group relative">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditOpen(true)}>
                        <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={handleDelete} disabled={loading}>
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg font-bold">{client.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{client.company}</p>
                        </div>
                        <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
                            {client.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pb-2 space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-2 h-3 w-3" />
                        {client.phone}
                    </div>
                    {client.email && (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="mr-2 h-3 w-3" />
                            {client.email}
                        </div>
                    )}
                    {client.notes && (
                        <p className="text-xs text-muted-foreground italic mt-2 border-t pt-2">
                            "{client.notes}"
                        </p>
                    )}
                </CardContent>
                <CardFooter className="pt-2">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Chat on WhatsApp
                        </a>
                    </Button>
                </CardFooter>
            </Card>
            <EditClientModal
                client={client}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
        </>
    )
}
