"use client";

import { createContext, useEffect, useState, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

type AuthContextType = {
    user: User | null;
    userRole: string | null;
    session: Session | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<{
        error: Error | null;
        success: boolean;
    }>;
    signUp: (email: string, password: string) => Promise<{
        error: Error | null;
        success: boolean;
    }>;
    signOut: () => Promise<{
        error: Error | null;
        success: boolean;
    }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function getSession() {
            setIsLoading(true);

            try {
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Error getting session:', error);
                    setIsLoading(false);
                    return;
                }

                if (data.session) {
                    setSession(data.session);
                    setUser(data.session.user);
                } else {
                    setSession(null);
                    setUser(null);
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    return {
                        error: error,
                        success: false,
                    }
                }
                return {
                    error: new Error('An unknown error occurred during sign out'),
                    success: false,
                }
            } finally {
                setIsLoading(false);
            }
        }
        getSession();
    }, []);
    useEffect(() => {
        async function fetchUserRole() {
            setIsLoading(true);
            try {
                if (!user) {
                    setUserRole(null);
                    return;
                }

                const { role, error } = await fetch('/api/user/role', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).then(res => res.json());

                if (error) {
                    console.error('Error fetching user role:', error);
                    setUserRole(null);
                    throw new Error(error.message || 'Failed to fetch user role');
                }

                setUserRole(role);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error('Error fetching user role:', error);
                    setUserRole(null);
                } else {
                    console.error('An unknown error occurred while fetching user role');
                    setUserRole(null);
                }
            } finally {
                setIsLoading(false);
            }
        }
        fetchUserRole();
    }, [user]);


    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                console.error('Login failed:', error);
                throw new Error(error?.message || 'Login failed');
            }

            setSession(data!.session);
            return { error: null, success: true };
        } catch (error: unknown) {
            if (error instanceof Error) {
                return {
                    error: error,
                    success: false,
                }
            }
            return {
                error: new Error('An unknown error occurred during sign out'),
                success: false,
            }
        }
    }

    const signUp = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) {
                console.error('Signup failed:', error);
                throw new Error(error?.message || 'Signup failed');
            }

            setSession(data?.session);
            setUser(data?.user ?? null);

            return { error: null, success: true };
        } catch (error: unknown) {
            if (error instanceof Error) {
                return {
                    error: error,
                    success: false,
                }
            }
            return {
                error: new Error('An unknown error occurred during sign out'),
                success: false,
            }
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Sign out failed:', error);
                throw new Error(error?.message || 'Sign out failed');
            }
            setUser(null);
            setSession(null);
            setUserRole(null);
            return { error: null, success: true };
        } catch (error: unknown) {
            if (error instanceof Error) {
                return {
                    error: error,
                    success: false,
                }
            }
            return {
                error: new Error('An unknown error occurred during sign out'),
                success: false,
            }
        }
    }

    const value = {
        user,
        userRole,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
    };
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
} 