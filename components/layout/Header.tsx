"use client"

import { useEffect, useState } from "react"

export function Header() {
    const [date, setDate] = useState<string>("")

    useEffect(() => {
        const now = new Date()
        setDate(now.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    }, [])

    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
            <div>
                <h2 className="text-lg font-semibold">Welcome back, Don Razak</h2>
                <p className="text-xs text-muted-foreground">{date}</p>
            </div>
            <div className="flex items-center gap-4">
                {/* Add notifications or other header items here */}
            </div>
        </header>
    )
}
