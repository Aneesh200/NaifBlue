'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
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
  signOut: () => Promise<void>;
  googleSignIn: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
          
          // Create a user profile if it doesn't exist
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            // PGRST116 means no rows returned, which is fine (new user)
            console.error('Error fetching profile:', profileError);
          }
          
          if (!profile) {
            // Create new profile using the server-side API
            try {
              const response = await fetch('/api/profile/create', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  id: data.session.user.id,
                  email: data.session.user.email,
                }),
              });
              
              if (!response.ok) {
                const errorData = await response.json();
                console.error('Error creating profile via API:', errorData.error);
              }
            } catch (error) {
              console.error('Failed to call profile creation API:', error);
            }
          }
        }
      } catch (error) {
        console.error('Unexpected error in getSession:', error);
      } finally {
        setIsLoading(false);
      }
    }

    // Initial session check
    getSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        try {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (event === 'SIGNED_IN' && newSession) {
            // Create a user profile if it doesn't exist
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .single();
              
            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Error fetching profile on auth change:', profileError);
            }
            
            if (!profile) {
              try {
                const response = await fetch('/api/profile/create', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    id: newSession.user.id,
                    email: newSession.user.email,
                  }),
                });
                
                if (!response.ok) {
                  const errorData = await response.json();
                  console.error('Error creating profile on auth change:', errorData.error);
                }
              } catch (error) {
                console.error('Failed to call profile creation API on auth change:', error);
              }
            }
            
            router.refresh();
          }
          
          if (event === 'SIGNED_OUT') {
            router.refresh();
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      return { error, success: false };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Starting signup process for:", email);
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) {
        console.error("Supabase auth signup error:", error);
        throw error;
      }
      
      console.log("Supabase auth signup successful:", data.user?.id);
      
      // If there's a user created, immediately create a profile
      if (data.user) {
        try {
          console.log("Attempting to create profile for new user:", data.user.id);
          // Create profile using server API
          const response = await fetch('/api/profile/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: data.user.id,
              email: data.user.email,
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error creating profile during signup:', errorData.error);
            console.error('Response status:', response.status);
            console.error('Full response:', await response.text());
          } else {
            console.log("Profile creation API call successful");
            const responseData = await response.json();
            console.log("Profile creation API response:", responseData);
          }
        } catch (profileError) {
          console.error('Failed to call profile creation API during signup:', profileError);
        }
      }
      
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      return { error, success: false };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const googleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    googleSignIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 