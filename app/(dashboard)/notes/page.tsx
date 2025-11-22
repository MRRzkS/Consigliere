"use client"

import { useEffect, useState } from "react"
import { useStore, Note } from "@/store/useStore"
import { createClient } from "@/utils/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, FileDown, Save, Trash2, FileText } from "lucide-react"
import { format } from "date-fns"
import { jsPDF } from "jspdf"
import { cn } from "@/lib/utils"

export default function NotesPage() {
    const { notes, setNotes, addNote, updateNote, removeNote } = useStore()
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
    const [editorTitle, setEditorTitle] = useState("")
    const [editorContent, setEditorContent] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchNotes = async () => {
            const { data, error } = await supabase
                .from('meeting_notes')
                .select('*')
                .order('created_at', { ascending: false })

            if (data) {
                setNotes(data as Note[])
                if (data.length > 0 && !selectedNoteId) {
                    // Optional: Select first note by default
                    // setSelectedNoteId(data[0].id)
                    // setEditorTitle(data[0].title)
                    // setEditorContent(data[0].content || "")
                }
            }
            setLoading(false)
        }

        fetchNotes()
    }, [setNotes])

    const handleSelectNote = (note: Note) => {
        setSelectedNoteId(note.id)
        setEditorTitle(note.title)
        setEditorContent(note.content || "")
    }

    const handleNewNote = () => {
        setSelectedNoteId(null)
        setEditorTitle("")
        setEditorContent("")
    }

    const handleSave = async () => {
        if (!editorTitle.trim()) return

        setIsSaving(true)
        try {
            if (selectedNoteId) {
                // Update existing
                const { data, error } = await supabase
                    .from('meeting_notes')
                    .update({ title: editorTitle, content: editorContent })
                    .eq('id', selectedNoteId)
                    .select()
                    .single()

                if (error) throw error
                if (data) updateNote(data as Note)
            } else {
                // Create new
                const { data, error } = await supabase
                    .from('meeting_notes')
                    .insert([{ title: editorTitle, content: editorContent }])
                    .select()
                    .single()

                if (error) throw error
                if (data) {
                    addNote(data as Note)
                    setSelectedNoteId(data.id)
                }
            }
        } catch (error) {
            console.error('Error saving note:', error)
            alert('Failed to save note.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this note?")) return
        try {
            const { error } = await supabase
                .from('meeting_notes')
                .delete()
                .eq('id', id)

            if (error) throw error
            removeNote(id)
            if (selectedNoteId === id) {
                handleNewNote()
            }
        } catch (error) {
            console.error('Error deleting note:', error)
        }
    }

    const handleExportPDF = () => {
        const doc = new jsPDF()
        const date = new Date()
        const formattedDate = format(date, 'ddMMyyyy_HHmm')
        const fileName = `${formattedDate}.pdf`

        doc.setFontSize(18)
        doc.setFont("helvetica", "bold")
        doc.text(editorTitle || "Untitled Note", 20, 20)

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text(`Date: ${format(date, 'dd MMM yyyy HH:mm')}`, 20, 30)

        doc.setFontSize(12)
        const splitText = doc.splitTextToSize(editorContent, 170)
        doc.text(splitText, 20, 40)

        doc.save(fileName)
    }

    const filteredNotes = notes.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] md:flex-row gap-6">
            {/* Sidebar List */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">The Scribe</h1>
                    <Button size="sm" onClick={handleNewNote}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Note
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search notes..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {filteredNotes.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No notes found.</p>
                    ) : (
                        filteredNotes.map(note => (
                            <Card
                                key={note.id}
                                className={cn(
                                    "cursor-pointer hover:bg-accent transition-colors",
                                    selectedNoteId === note.id ? "border-primary bg-accent" : ""
                                )}
                                onClick={() => handleSelectNote(note)}
                            >
                                <CardContent className="p-4">
                                    <h3 className="font-semibold truncate">{note.title}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {format(new Date(note.created_at), 'dd MMM yyyy')}
                                    </p>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                        {note.content}
                                    </p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <div className="w-full md:w-2/3 flex flex-col gap-4 h-full">
                <Card className="flex-1 flex flex-col h-full">
                    <CardContent className="p-6 flex flex-col h-full gap-4">
                        <div className="flex items-center gap-2">
                            <Input
                                className="text-xl font-bold border-none shadow-none focus-visible:ring-0 px-0"
                                placeholder="Note Title"
                                value={editorTitle}
                                onChange={(e) => setEditorTitle(e.target.value)}
                            />
                            <div className="flex items-center gap-2 shrink-0">
                                {selectedNoteId && (
                                    <Button variant="ghost" size="icon" onClick={handleExportPDF} title="Export PDF">
                                        <FileDown className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={handleSave} disabled={isSaving} title="Save">
                                    <Save className="h-4 w-4" />
                                </Button>
                                {selectedNoteId && (
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(selectedNoteId)} title="Delete">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <Textarea
                            className="flex-1 resize-none border-none shadow-none focus-visible:ring-0 p-0 text-base leading-relaxed"
                            placeholder="Start writing..."
                            value={editorContent}
                            onChange={(e) => setEditorContent(e.target.value)}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
