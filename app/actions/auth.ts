'use server'
import { createClient } from '@/utils/supabase/server'

const supabase = await createClient()
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function login(email: string, password: string) {
    if (!email || !password) {
        return {
            data: null,
            error: new Error('Email and password are required'),
            success: false,
            message: 'Login failed',
        }
    }

    if (!emailRegex.test(email)) {
        return {
            data: null,
            error: new Error('Invalid email format'),
            success: false,
            message: 'Signup failed',
        }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    })

    if (error) {
        return {
            data: null,
            error: error,
            success: false,
            message: 'Login failed',
        }
    }

    return {
        data: data,
        success: true,
        message: 'Login successful',
        error: null,
    }
}

export async function signup(email: string, password: string) {
    if (!email || !password) {
        return {
            data: null,
            error: new Error('Email and password are required'),
            success: false,
            message: 'Signup failed',
        }
    }
    if (!emailRegex.test(email)) {
        return {
            data: null,
            error: new Error('Invalid email format'),
            success: false,
            message: 'Signup failed',
        }
    }

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}`,
        },
    })

    if (error) {
        return {
            data: null,
            error: error,
            success: false,
            message: 'Login failed',
        }
    }

    return {
        data: data,
        success: true,
        message: 'Signup successful',
        error: null,
    }
}

export async function logout() {
    const { error } = await supabase.auth.signOut()

    console.log('Logout error:', error)

    if (error) {
        return {
            success: false,
            message: 'Logout failed',
            error: error,
        }
    }

    return {
        success: true,
        message: 'Logout successful',
        error: null,
    }
}