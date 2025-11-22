import { create } from 'zustand'

export type ProjectStatus = 'Negotiation' | 'In Development' | 'Deployed'

export interface Project {
    id: string
    clientName: string
    deadline: string
    value: number
    status: ProjectStatus
    previewLink?: string
}

export interface Transaction {
    id: string
    date: string
    description: string
    category: 'Business' | 'Personal'
    amount: number
    type: 'Income' | 'Expense'
}

export interface Asset {
    id: string
    title: string
    content: string
    type: 'Prompt' | 'Component'
    language?: string
}

export interface Client {
    id: string
    name: string
    company: string
    phone: string
    email?: string
    status: 'Active' | 'Prospect' | 'Closed'
    notes?: string
    lastContact?: string
    totalValue?: number
    source?: string
    createdAt: string
}

export interface Note {
    id: string
    title: string
    content: string
    client_id?: string
    created_at: string
}

export interface Activity {
    id: string
    client_id: string
    type: 'Call' | 'Meeting' | 'Email' | 'Note'
    content: string
    created_at: string
}

export interface Task {
    id: string
    client_id: string
    title: string
    due_date?: string
    completed: boolean
    created_at: string
}

interface StoreState {
    projects: Project[]
    transactions: Transaction[]
    assets: Asset[]
    clients: Client[]
    notes: Note[]
    activities: Activity[]
    tasks: Task[]
    addProject: (project: Project) => void
    setProjects: (projects: Project[]) => void
    updateProject: (updatedProject: Project) => void
    removeProject: (id: string) => void
    updateProjectStatus: (id: string, status: ProjectStatus) => void
    addTransaction: (transaction: Transaction) => void
    setTransactions: (transactions: Transaction[]) => void
    addAsset: (asset: Asset) => void
    setAssets: (assets: Asset[]) => void
    addClient: (client: Client) => void
    setClients: (clients: Client[]) => void
    updateClient: (updatedClient: Client) => void
    removeClient: (id: string) => void
    addNote: (note: Note) => void
    setNotes: (notes: Note[]) => void
    updateNote: (updatedNote: Note) => void
    removeNote: (id: string) => void
    addActivity: (activity: Activity) => void
    setActivities: (activities: Activity[]) => void
    addTask: (task: Task) => void
    setTasks: (tasks: Task[]) => void
    toggleTask: (id: string) => void
    // Pomodoro
    pomodoro: {
        status: 'FOCUS' | 'BREAK'
        timeLeft: number
        isActive: boolean
    }
    startTimer: () => void
    pauseTimer: () => void
    resetTimer: () => void
    tick: () => void
    setPomodoroStatus: (status: 'FOCUS' | 'BREAK') => void
    setTimeLeft: (time: number) => void

    // Music
    music: {
        url: string
        isPlaying: boolean
        volume: number
        isWidgetOpen: boolean
    }
    setMusicUrl: (url: string) => void
    toggleMusicPlay: () => void
    setMusicVolume: (volume: number) => void
    toggleMusicWidget: () => void
}

export const useStore = create<StoreState>((set) => ({
    projects: [],
    transactions: [],
    assets: [],
    clients: [],
    notes: [],
    activities: [],
    tasks: [],
    addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
    setProjects: (projects) => set({ projects }),
    updateProject: (updatedProject) => set((state) => ({
        projects: state.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
    })),
    removeProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
    })),
    updateProjectStatus: (id, status) => set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? { ...p, status } : p)),
    })),
    addTransaction: (transaction) => set((state) => ({ transactions: [transaction, ...state.transactions] })),
    setTransactions: (transactions: Transaction[]) => set({ transactions }),
    addAsset: (asset) => set((state) => ({ assets: [asset, ...state.assets] })),
    setAssets: (assets) => set({ assets }),
    addClient: (client) => set((state) => ({ clients: [client, ...state.clients] })),
    setClients: (clients) => set({ clients }),
    updateClient: (updatedClient) => set((state) => ({
        clients: state.clients.map((c) => (c.id === updatedClient.id ? updatedClient : c)),
    })),
    removeClient: (id) => set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
    })),
    addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
    setNotes: (notes) => set({ notes }),
    updateNote: (updatedNote) => set((state) => ({
        notes: state.notes.map((n) => (n.id === updatedNote.id ? updatedNote : n)),
    })),
    removeNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
    })),
    addActivity: (activity) => set((state) => ({ activities: [activity, ...state.activities] })),
    setActivities: (activities) => set({ activities }),
    addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
    setTasks: (tasks) => set({ tasks }),
    toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    })),
    // Pomodoro State
    pomodoro: {
        status: 'FOCUS',
        timeLeft: 25 * 60,
        isActive: true,
    },
    startTimer: () => set((state) => ({ pomodoro: { ...state.pomodoro, isActive: true } })),
    pauseTimer: () => set((state) => ({ pomodoro: { ...state.pomodoro, isActive: false } })),
    resetTimer: () => set((state) => ({
        pomodoro: {
            ...state.pomodoro,
            isActive: true,
            timeLeft: state.pomodoro.status === 'FOCUS' ? 25 * 60 : 5 * 60
        }
    })),
    tick: () => set((state) => {
        // Hardcore Mode: Always tick
        // if (!state.pomodoro.isActive) return state
        if (state.pomodoro.timeLeft <= 0) {
            // Switch mode
            const newStatus = state.pomodoro.status === 'FOCUS' ? 'BREAK' : 'FOCUS'
            const newTime = newStatus === 'FOCUS' ? 25 * 60 : 5 * 60
            return {
                pomodoro: {
                    ...state.pomodoro,
                    status: newStatus,
                    timeLeft: newTime,
                    isActive: false // Auto-pause on switch? User said "Timer berjalan mundur otomatis" (Timer runs backwards automatically). Maybe auto-start next phase? Or just switch and wait? "Saat Mode BREAK: Munculkan Overlay". Usually auto-start is aggressive. Let's keep it active.
                    // Actually, let's keep it active for "Aggressive" feel.
                }
            }
        }
        return { pomodoro: { ...state.pomodoro, timeLeft: state.pomodoro.timeLeft - 1 } }
    }),
    setPomodoroStatus: (status) => set((state) => ({
        pomodoro: {
            ...state.pomodoro,
            status,
            timeLeft: status === 'FOCUS' ? 25 * 60 : 5 * 60,
            isActive: false
        }
    })),
    setTimeLeft: (time) => set((state) => ({ pomodoro: { ...state.pomodoro, timeLeft: time } })),

    // Music State
    music: {
        url: 'https://youtu.be/c2Cc-6nT0S4?si=8f1-uMkTGOwzbmP6',
        isPlaying: true,
        volume: 0.5,
        isWidgetOpen: true
    },
    setMusicUrl: (url) => set((state) => ({ music: { ...state.music, url, isPlaying: true } })),
    toggleMusicPlay: () => set((state) => ({ music: { ...state.music, isPlaying: !state.music.isPlaying } })),
    setMusicVolume: (volume) => set((state) => ({ music: { ...state.music, volume } })),
    toggleMusicWidget: () => set((state) => ({ music: { ...state.music, isWidgetOpen: !state.music.isWidgetOpen } })),
}))
