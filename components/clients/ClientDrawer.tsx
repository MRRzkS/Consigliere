"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Client, useStore, Activity, Task } from "@/store/useStore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, Mail, Phone, MapPin, Calendar, DollarSign, Briefcase, FileText, Plus, CheckCircle2, Circle, Clock } from "lucide-react"
import { format } from "date-fns"
import { formatPhoneNumber } from "@/lib/formatPhoneNumber"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/client"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface ClientDrawerProps {
    client: Client | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ClientDrawer({ client, open, onOpenChange }: ClientDrawerProps) {
    const { projects, notes, activities, tasks, setActivities, setTasks, addActivity, addTask, toggleTask } = useStore()
    const [newActivity, setNewActivity] = useState({ type: 'Note', content: '' })
    const [newTask, setNewTask] = useState('')
    const supabase = createClient()

    useEffect(() => {
        if (client && open) {
            const fetchData = async () => {
                // Fetch Activities
                const { data: activityData } = await supabase
                    .from('activities')
                    .select('*')
                    .eq('client_id', client.id)
                    .order('created_at', { ascending: false })

                if (activityData) setActivities(activityData as Activity[])

                // Fetch Tasks
                const { data: taskData } = await supabase
                    .from('tasks')
                    .select('*')
                    .eq('client_id', client.id)
                    .order('created_at', { ascending: false })

                if (taskData) setTasks(taskData as Task[])
            }
            fetchData()
        }
    }, [client, open, setActivities, setTasks])

    if (!client) return null

    const clientProjects = projects.filter(p => p.clientName === client.name)
    const clientActivities = activities.filter(a => a.client_id === client.id)
    const clientTasks = tasks.filter(t => t.client_id === client.id)

    const whatsappLink = `https://wa.me/${formatPhoneNumber(client.phone)}`
    const initials = client.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

    const handleAddActivity = async () => {
        if (!newActivity.content) return

        const { data, error } = await supabase
            .from('activities')
            .insert([{
                client_id: client.id,
                type: newActivity.type,
                content: newActivity.content
            }])
            .select()

        if (data) {
            addActivity(data[0] as Activity)
            setNewActivity({ type: 'Note', content: '' })
        }
    }

    const handleAddTask = async () => {
        if (!newTask) return

        const { data, error } = await supabase
            .from('tasks')
            .insert([{
                client_id: client.id,
                title: newTask
            }])
            .select()

        if (data) {
            addTask(data[0] as Task)
            setNewTask('')
        }
    }

    const handleToggleTask = async (taskId: string, completed: boolean) => {
        const { error } = await supabase
            .from('tasks')
            .update({ completed: !completed })
            .eq('id', taskId)

        if (!error) {
            toggleTask(taskId)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader className="space-y-4 pb-6 border-b border-border">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary">
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${client.name}&background=c5a059&color=09090b`} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-serif">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <SheetTitle className="text-2xl font-serif">{client.name}</SheetTitle>
                            <SheetDescription className="text-base font-medium text-muted-foreground">
                                {client.company}
                            </SheetDescription>
                            <Badge variant={client.status === 'Active' ? 'default' : 'secondary'} className="mt-1">
                                {client.status}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="mr-2 h-4 w-4" />
                                WhatsApp
                            </a>
                        </Button>
                        {client.email && (
                            <Button variant="outline" className="flex-1" asChild>
                                <a href={`mailto:${client.email}`}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Email
                                </a>
                            </Button>
                        )}
                    </div>
                </SheetHeader>

                <div className="mt-6">
                    <Tabs defaultValue="activity">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="activity">Activity</TabsTrigger>
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="projects">Projects</TabsTrigger>
                        </TabsList>

                        <TabsContent value="activity" className="mt-6 space-y-6">
                            {/* Task Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold font-serif uppercase tracking-wider text-primary">Tasks</h3>
                                    <span className="text-xs text-muted-foreground">{clientTasks.filter(t => !t.completed).length} Pending</span>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a new task..."
                                        value={newTask}
                                        onChange={(e) => setNewTask(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                        className="h-8 text-sm"
                                    />
                                    <Button size="sm" onClick={handleAddTask} disabled={!newTask}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {clientTasks.map(task => (
                                        <div key={task.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 group">
                                            <button onClick={() => handleToggleTask(task.id, task.completed)}>
                                                {task.completed ? (
                                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                                ) : (
                                                    <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                )}
                                            </button>
                                            <span className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                                {task.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Activity Log */}
                            <div className="space-y-4 pt-4 border-t border-border">
                                <h3 className="text-sm font-bold font-serif uppercase tracking-wider text-primary">Timeline</h3>

                                {/* Log Activity Form */}
                                <div className="bg-muted/30 p-4 rounded-lg space-y-3 border border-border/50">
                                    <div className="flex gap-2">
                                        <Select
                                            value={newActivity.type}
                                            onValueChange={(val) => setNewActivity({ ...newActivity, type: val })}
                                        >
                                            <SelectTrigger className="w-[120px] h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Note">Note</SelectItem>
                                                <SelectItem value="Call">Call</SelectItem>
                                                <SelectItem value="Meeting">Meeting</SelectItem>
                                                <SelectItem value="Email">Email</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            placeholder="Log an interaction..."
                                            value={newActivity.content}
                                            onChange={(e) => setNewActivity({ ...newActivity, content: e.target.value })}
                                            className="h-8 text-sm flex-1"
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddActivity()}
                                        />
                                        <Button size="sm" className="h-8" onClick={handleAddActivity} disabled={!newActivity.content}>Log</Button>
                                    </div>
                                </div>

                                <div className="relative pl-6 border-l-2 border-border space-y-8 pt-2">
                                    {clientActivities.length === 0 && (
                                        <p className="text-sm text-muted-foreground italic">No activities recorded yet.</p>
                                    )}
                                    {clientActivities.map(activity => (
                                        <div key={activity.id} className="relative group">
                                            <div className="absolute -left-[29px] bg-background p-1">
                                                <div className={`h-3 w-3 rounded-full ${activity.type === 'Call' ? 'bg-blue-500' :
                                                        activity.type === 'Meeting' ? 'bg-purple-500' :
                                                            activity.type === 'Email' ? 'bg-yellow-500' :
                                                                'bg-zinc-500'
                                                    }`} />
                                            </div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{activity.type}</span>
                                                <span className="text-[10px] font-mono text-muted-foreground">
                                                    {format(new Date(activity.created_at), 'dd MMM HH:mm')}
                                                </span>
                                            </div>
                                            <p className="text-sm">{activity.content}</p>
                                        </div>
                                    ))}

                                    {/* System Events */}
                                    <div className="relative">
                                        <div className="absolute -left-[29px] bg-background p-1">
                                            <div className="h-3 w-3 rounded-full bg-primary" />
                                        </div>
                                        <div className="text-sm text-muted-foreground mb-1 font-mono">
                                            {format(new Date(client.createdAt), 'dd MMM yyyy')}
                                        </div>
                                        <p className="text-sm font-medium">Client Created</p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="details" className="space-y-6 mt-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-serif font-bold border-b border-border pb-2">Contact Info</h3>
                                <div className="grid gap-4 text-sm">
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-primary" />
                                        <span className="font-mono">{client.phone}</span>
                                    </div>
                                    {client.email && (
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-primary" />
                                            <span>{client.email}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <span>Jakarta, Indonesia</span> {/* Placeholder */}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-serif font-bold border-b border-border pb-2">Business Intel</h3>
                                <div className="grid gap-4 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Total Value</span>
                                        <span className="font-mono font-bold text-primary">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(client.totalValue || 0)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Source</span>
                                        <span>{client.source || 'Unknown'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Last Contact</span>
                                        <span className="font-mono">
                                            {client.lastContact ? format(new Date(client.lastContact), 'dd MMM yyyy') : 'Never'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {client.notes && (
                                <div className="space-y-2">
                                    <h3 className="text-lg font-serif font-bold border-b border-border pb-2">Notes</h3>
                                    <p className="text-sm text-muted-foreground italic p-4 bg-muted/50 rounded-md border border-border/50">
                                        "{client.notes}"
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="projects" className="mt-6 space-y-4">
                            {clientProjects.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No active projects.</p>
                            ) : (
                                clientProjects.map(project => (
                                    <div key={project.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Briefcase className="h-8 w-8 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{project.clientName}</p> {/* Project Title usually */}
                                                <p className="text-xs text-muted-foreground">{project.status}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono font-bold text-sm">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(project.value)}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-mono">
                                                Due {format(new Date(project.deadline), 'dd MMM')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    )
}
