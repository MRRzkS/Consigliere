"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStore, Asset } from "@/store/useStore"
import { Copy, Check, Search, Filter } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { NewAssetModal } from "@/components/armory/NewAssetModal"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Badge } from "@/components/ui/badge"

export default function ArmoryPage() {
    const { assets, setAssets } = useStore()
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'All' | 'Prompt' | 'Component'>('All')
    const [search, setSearch] = useState('')
    const [copiedId, setCopiedId] = useState<string | null>(null)

    useEffect(() => {
        const fetchAssets = async () => {
            const { data, error } = await supabase
                .from('armory')
                .select('*')
                .order('created_at', { ascending: false })

            if (data) {
                const mappedAssets = data.map((a: any) => ({
                    id: a.id,
                    title: a.title,
                    type: a.type as 'Prompt' | 'Component',
                    content: a.content,
                    language: a.language,
                }))
                setAssets(mappedAssets)
            }
            setLoading(false)
        }

        fetchAssets()
    }, [setAssets])

    const handleCopy = (content: string, id: string) => {
        navigator.clipboard.writeText(content)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const filteredAssets = assets.filter(asset => {
        const matchesFilter = filter === 'All' || asset.type === filter
        const matchesSearch = asset.title.toLowerCase().includes(search.toLowerCase())
        return matchesFilter && matchesSearch
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">The Armory</h1>
                <NewAssetModal />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                    <Button
                        variant={filter === 'All' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('All')}
                    >
                        All
                    </Button>
                    <Button
                        variant={filter === 'Prompt' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('Prompt')}
                    >
                        Prompts
                    </Button>
                    <Button
                        variant={filter === 'Component' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('Component')}
                    >
                        Components
                    </Button>
                </div>
                <div className="relative w-full md:w-64 ml-auto">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search weapons..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAssets.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No weapons found in the armory.
                    </div>
                ) : (
                    filteredAssets.map((asset) => (
                        <Card key={asset.id} className="flex flex-col h-full max-h-[500px]">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium truncate pr-4" title={asset.title}>
                                    {asset.title}
                                </CardTitle>
                                <Badge variant={asset.type === 'Prompt' ? 'default' : 'secondary'}>
                                    {asset.type}
                                </Badge>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden flex flex-col">
                                <div className="flex-1 overflow-y-auto rounded-md border bg-muted/50 text-xs relative group">
                                    {asset.type === 'Component' ? (
                                        <SyntaxHighlighter
                                            language={asset.language || 'javascript'}
                                            style={vscDarkPlus}
                                            customStyle={{ margin: 0, borderRadius: '0.375rem', fontSize: '0.75rem' }}
                                            wrapLongLines={true}
                                        >
                                            {asset.content}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <div className="p-3 whitespace-pre-wrap font-mono text-muted-foreground">
                                            {asset.content}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`mt-4 w-full transition-colors ${copiedId === asset.id ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-600 border-emerald-500/50' : ''}`}
                                    onClick={() => handleCopy(asset.content, asset.id)}
                                >
                                    {copiedId === asset.id ? (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="mr-2 h-4 w-4" />
                                            Copy to Clipboard
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
