import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabaseAdmin';

/**
 * Ensures a profile exists for the given user ID
 * @param userId The user ID to ensure a profile for
 * @param email The user's email
 * @returns A promise resolving to a boolean indicating success
 */
export async function ensureProfile(
  userId: string,
  email: string
): Promise<boolean> {
  try {
    // Check if profile exists using admin client
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error checking for profile:', profileError);
      return false;
    }
    
    // If profile exists, no need to create one
    if (profile) {
      return true;
    }
    
    // Create profile using admin client
    const { error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (insertError) {
      console.error('Error creating profile:', insertError);
      console.error('Error details:', JSON.stringify(insertError));
      return false;
    }
    
    console.log('Profile created successfully for user:', userId);
    return true;
  } catch (error) {
    console.error('Unexpected error in ensureProfile:', error);
    return false;
  }
} 