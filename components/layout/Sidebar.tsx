"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Briefcase, PieChart, Archive, LogOut, Users, FileText } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Operations", href: "/operations", icon: Briefcase },
    { name: "The Books", href: "/finances", icon: PieChart },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "The Scribe", href: "/notes", icon: FileText },
    { name: "The Armory", href: "/armory", icon: Archive },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    return (
        <div className="flex h-full w-64 flex-col border-r border-border bg-[#050505] text-card-foreground">
            <div className="flex h-16 items-center border-b border-border px-6">
                <h1 className="text-xl font-bold tracking-tight">The Consigliere</h1>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "text-primary border-l-2 border-primary bg-primary/5"
                                    : "text-muted-foreground hover:text-primary hover:bg-primary/5 border-l-2 border-transparent"
                            )}
                        >
                            <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
            <div className="border-t border-border p-4 space-y-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-zinc-700">
                        <AvatarImage src="/profile.jpg" alt="Don Razak" className="object-cover" />
                        <AvatarFallback>DR</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium">Don Razak</p>
                        <p className="text-xs text-muted-foreground">Boss</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    )
}
