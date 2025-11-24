"use client"

import { useEffect, useRef } from "react"
import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, SkipForward, Coffee, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

export function PomodoroOverlay() {
    const { pomodoro, tick, setPomodoroStatus, setTimeLeft } = useStore()

    // Hardcore Logic: Auto-start & Persistence
    useEffect(() => {
        // Request Notification Permission on mount
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission()
        }

        const checkTimer = () => {
            const storedTarget = localStorage.getItem('pomodoroTargetTime')
            const now = Date.now()

            if (storedTarget) {
                const targetTime = parseInt(storedTarget)
                const diff = Math.ceil((targetTime - now) / 1000)

                if (diff <= 0) {
                    // Time's up! Switch mode
                    // The store handles the actual switch in `tick` or we can trigger it here?
                    // The store `tick` handles it if we call it.
                } else {
                    // Sync state with real time
                }
            } else {
                // First run: Start 25m Focus
                const targetTime = now + 25 * 60 * 1000
                localStorage.setItem('pomodoroTargetTime', targetTime.toString())
            }
        }

        // Initial check
        const storedTarget = localStorage.getItem('pomodoroTargetTime')
        if (storedTarget) {
            const diff = Math.ceil((parseInt(storedTarget) - Date.now()) / 1000)
        }

        const interval = setInterval(() => {
            checkTimer()
            tick()
        }, 1000)

        return () => clearInterval(interval)
    }, [pomodoro.status, setPomodoroStatus, tick])

    // Sync Display on Mount/Refresh (Critical for Anti-Cheat)
    useEffect(() => {
        const storedTarget = localStorage.getItem('pomodoroTargetTime')
        if (storedTarget) {
            const diff = Math.ceil((parseInt(storedTarget) - Date.now()) / 1000)
            if (diff > 0) {
                setTimeLeft(diff)
            }
        }
    }, [setTimeLeft])

    // Ref to track previous status to only notify on CHANGE
    const prevStatusRef = useRef(pomodoro.status)

    useEffect(() => {
        if (prevStatusRef.current !== pomodoro.status) {
            // Status Changed!
            const isBreak = pomodoro.status === 'BREAK'
            const title = isBreak ? "Rest, Godfather." : "Back to Business."
            const body = isBreak ? "Take a break. The business can wait." : "Focus time started."

            // Play Sound
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                try {
                    const ctx = new AudioContext();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sine';
                    // Nice "Ding"
                    osc.frequency.setValueAtTime(isBreak ? 440 : 880, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(isBreak ? 880 : 440, ctx.currentTime + 0.1);
                    gain.gain.setValueAtTime(0.1, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1);
                    osc.start();
                    osc.stop(ctx.currentTime + 1);
                } catch (e) {
                    console.error("Audio play failed", e);
                }
            }

            // Send Notification
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification(title, { body, icon: "/favicon.ico" });
            }

            prevStatusRef.current = pomodoro.status
        }
    }, [pomodoro.status])

    const formatTime = (seconds: number) => {
        // Prevent negative display
        const safeSeconds = Math.max(0, seconds)
        const mins = Math.floor(safeSeconds / 60)
        const secs = safeSeconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // Mini Timer (Visible during FOCUS)
    if (pomodoro.status === 'FOCUS') {
        return (
            <div className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-md border border-border/50 rounded-full px-4 py-2 flex items-center gap-3 shadow-lg hover:bg-background transition-colors group cursor-not-allowed select-none">
                <div className="flex items-center gap-2 text-sm font-medium font-mono">
                    <Briefcase className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-foreground">
                        {formatTime(pomodoro.timeLeft)}
                    </span>
                </div>
                {/* Controls Removed for Hardcore Mode */}
            </div>
        )
    }

    // Full Screen Overlay (Visible during BREAK)
    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-4 animate-in fade-in duration-500 cursor-not-allowed select-none">
            <div className="space-y-8 max-w-2xl">
                <div className="space-y-2">
                    <Coffee className="h-16 w-16 text-amber-500 mx-auto mb-6 animate-bounce" />
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                        Rest, Godfather.
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-400 font-light">
                        The business can wait.
                    </p>
                </div>

                <div className="text-[8rem] md:text-[12rem] font-bold font-mono text-white leading-none tracking-tighter tabular-nums">
                    {formatTime(pomodoro.timeLeft)}
                </div>

                <div className="flex items-center justify-center gap-4">
                    {/* Pause/Resume Removed */}

                    <Button
                        variant="destructive"
                        size="lg"
                        onClick={() => {
                            // Emergency Skip: Reset Target to Now + 25m (Focus)
                            const now = Date.now()
                            const targetTime = now + 25 * 60 * 1000
                            localStorage.setItem('pomodoroTargetTime', targetTime.toString())
                            setPomodoroStatus('FOCUS')
                        }}
                    >
                        <SkipForward className="mr-2 h-5 w-5" />
                        Emergency Skip
                    </Button>
                </div>
            </div>
        </div>
    )
}
