"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Briefcase, PieChart, Archive, LogOut, Users, Menu, X, FileText } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"

const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Operations", href: "/operations", icon: Briefcase },
    { name: "The Books", href: "/finances", icon: PieChart },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "The Scribe", href: "/notes", icon: FileText },
    { name: "The Armory", href: "/armory", icon: Archive },
]

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    return (
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-card text-card-foreground">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
                    <Menu className="h-6 w-6" />
                </Button>
                <h1 className="text-lg font-bold tracking-tight">The Consigliere</h1>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs bg-card border-r shadow-lg transition-transform duration-300 ease-in-out transform",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold">Menu</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="h-6 w-6" />
                    </Button>
                </div>
                <nav className="flex-1 space-y-1 p-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4 space-y-4 bg-card">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20" />
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
        </div>
    )
}
