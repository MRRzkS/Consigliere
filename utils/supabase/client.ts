import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    // Create a singleton instance that persists across HMR
    if (typeof window !== 'undefined') {
        const globalWithSupabase = window as any
        if (!globalWithSupabase._supabaseClient) {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

            if (!supabaseUrl || !supabaseKey) {
                console.error("Supabase environment variables are missing!")
                console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl)
                console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseKey ? "Set" : "Not Set")
            }

            globalWithSupabase._supabaseClient = createBrowserClient(
                supabaseUrl || '',
                supabaseKey || ''
            )
        }
        return globalWithSupabase._supabaseClient
    }

    // Fallback for non-browser environments
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
}
