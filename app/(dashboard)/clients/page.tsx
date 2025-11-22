"use client"

import { useEffect, useState } from "react"
import { useStore, Client } from "@/store/useStore"
import { createClient } from "@/utils/supabase/client"
import { Input } from "@/components/ui/input"
import { Search, Filter, ChevronRight, MoreHorizontal, LayoutGrid, List } from "lucide-react"
import { NewClientModal } from "@/components/clients/NewClientModal"
import { ClientDrawer } from "@/components/clients/ClientDrawer"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ClientsPage() {
    const { clients, setClients } = useStore()
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table')
    const supabase = createClient()

    useEffect(() => {
        const fetchClients = async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false })

            if (data) {
                const mappedClients = data.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    company: c.company,
                    phone: c.phone,
                    email: c.email,
                    status: c.status as 'Active' | 'Prospect' | 'Closed',
                    notes: c.notes,
                    lastContact: c.last_contact,
                    totalValue: c.total_value,
                    source: c.source,
                    createdAt: c.created_at
                }))
                setClients(mappedClients)
            }
            setLoading(false)
        }

        fetchClients()
    }, [setClients])

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const handleRowClick = (client: Client) => {
        setSelectedClient(client)
        setDrawerOpen(true)
    }

    const updateClientStatus = async (clientId: string, newStatus: 'Active' | 'Prospect' | 'Closed') => {
        // Optimistic update
        const updatedClients = clients.map(c => c.id === clientId ? { ...c, status: newStatus } : c)
        setClients(updatedClients)

        const { error } = await supabase
            .from('clients')
            .update({ status: newStatus })
            .eq('id', clientId)

        if (error) {
            // Revert on error (simplified for now)
            console.error("Failed to update status", error)
        }
    }

    const onDragStart = (e: React.DragEvent, clientId: string) => {
        e.dataTransfer.setData("clientId", clientId)
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const onDrop = (e: React.DragEvent, status: 'Active' | 'Prospect' | 'Closed') => {
        const clientId = e.dataTransfer.getData("clientId")
        if (clientId) {
            updateClientStatus(clientId, status)
        }
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <h1 className="text-3xl font-bold tracking-tight font-serif">Clients</h1>
                <div className="flex items-center gap-2">
                    <div className="bg-muted/50 p-1 rounded-lg border border-border/50 flex">
                        <Button
                            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('table')}
                            className="h-8 w-8 p-0"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'pipeline' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('pipeline')}
                            className="h-8 w-8 p-0"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                    <NewClientModal />
                </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clients..."
                        className="pl-8 bg-muted/50 border-border/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            ) : (
                <div className="flex-1 overflow-hidden rounded-md border border-zinc-800 bg-card/50 backdrop-blur-sm flex flex-col">
                    {viewMode === 'table' ? (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs uppercase bg-zinc-900/50 sticky top-0 z-10 backdrop-blur-md">
                                        <tr>
                                            <th className="px-6 py-3 font-medium text-[#c5a059] tracking-wider border-b border-zinc-800">Client Name</th>
                                            <th className="px-6 py-3 font-medium text-[#c5a059] tracking-wider border-b border-zinc-800">Status</th>
                                            <th className="px-6 py-3 font-medium text-[#c5a059] tracking-wider border-b border-zinc-800">Last Contact</th>
                                            <th className="px-6 py-3 font-medium text-[#c5a059] tracking-wider border-b border-zinc-800 text-right">Value</th>
                                            <th className="px-6 py-3 font-medium text-[#c5a059] tracking-wider border-b border-zinc-800 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800">
                                        {filteredClients.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                                    No clients found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredClients.map((client, index) => (
                                                <tr
                                                    key={client.id}
                                                    className={`
                                                        group transition-colors cursor-pointer
                                                        ${index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'}
                                                        hover:bg-[#c5a059]/10
                                                    `}
                                                    onClick={() => handleRowClick(client)}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8 border border-zinc-700">
                                                                <AvatarImage src={`https://ui-avatars.com/api/?name=${client.name}&background=random`} />
                                                                <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-bold text-[#e5e5e5] group-hover:text-[#c5a059] transition-colors">{client.name}</div>
                                                                <div className="text-xs text-zinc-500">{client.company}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Badge
                                                            variant="outline"
                                                            className={`
                                                                ${client.status === 'Active' ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/10' :
                                                                    client.status === 'Prospect' ? 'border-[#c5a059]/50 text-[#c5a059] bg-[#c5a059]/10' :
                                                                        'border-zinc-500 text-zinc-500'}
                                                            `}
                                                        >
                                                            {client.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-zinc-400 text-xs">
                                                        {client.lastContact ? format(new Date(client.lastContact), 'dd MMM yyyy') : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-medium text-[#e5e5e5]">
                                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(client.totalValue || 0)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile List */}
                            <div className="md:hidden overflow-y-auto divide-y divide-zinc-800">
                                {filteredClients.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">No clients found.</div>
                                ) : (
                                    filteredClients.map(client => (
                                        <div
                                            key={client.id}
                                            className="p-4 active:bg-zinc-900 transition-colors cursor-pointer flex items-center justify-between"
                                            onClick={() => handleRowClick(client)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-zinc-700">
                                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${client.name}&background=random`} />
                                                    <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-bold text-[#e5e5e5]">{client.name}</div>
                                                    <div className="text-xs text-zinc-500">{client.company}</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xs font-mono text-zinc-500">
                                                    {client.lastContact ? format(new Date(client.lastContact), 'dd/MM') : ''}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] h-5 px-1"
                                                >
                                                    {client.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        /* Pipeline View (Kanban) */
                        <div className="flex-1 overflow-x-auto p-4">
                            <div className="flex gap-4 h-full min-w-[800px]">
                                {['Prospect', 'Active', 'Closed'].map(status => (
                                    <div
                                        key={status}
                                        className="flex-1 flex flex-col bg-zinc-900/30 rounded-lg border border-zinc-800"
                                        onDragOver={onDragOver}
                                        onDrop={(e) => onDrop(e, status as any)}
                                    >
                                        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
                                            <h3 className="font-serif font-bold text-[#c5a059] uppercase tracking-wider text-xs">{status}</h3>
                                            <Badge variant="secondary" className="text-[10px] h-5 px-1">
                                                {filteredClients.filter(c => c.status === status).length}
                                            </Badge>
                                        </div>
                                        <div className="p-2 flex-1 overflow-y-auto space-y-2">
                                            {filteredClients.filter(c => c.status === status).map(client => (
                                                <div
                                                    key={client.id}
                                                    draggable
                                                    onDragStart={(e) => onDragStart(e, client.id)}
                                                    onClick={() => handleRowClick(client)}
                                                    className="bg-card p-3 rounded border border-zinc-800 cursor-grab active:cursor-grabbing hover:border-[#c5a059]/50 transition-colors shadow-sm"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold text-sm truncate">{client.name}</span>
                                                        {(client.totalValue || 0) > 0 && (
                                                            <span className="text-[10px] font-mono text-emerald-500">
                                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', notation: 'compact' }).format(client.totalValue || 0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate mb-2">{client.company}</p>
                                                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                                                        <span>{client.lastContact ? format(new Date(client.lastContact), 'dd MMM') : 'No contact'}</span>
                                                        <Avatar className="h-4 w-4">
                                                            <AvatarImage src={`https://ui-avatars.com/api/?name=${client.name}&background=random`} />
                                                            <AvatarFallback>{client.name.substring(0, 1)}</AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <ClientDrawer
                client={selectedClient}
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
            />
        </div>
    )
}
