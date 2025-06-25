import { supabase } from '@/integrations/supabase/client';

export const isGlobalAdmin = async (userUuid?: string): Promise<boolean> => {
  try {
    console.log('=== CHECKING GLOBAL ADMIN PERMISSIONS ===');
    
    let userId = userUuid;
    
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No authenticated user found');
        return false;
      }
      userId = user.id;
    }
    
    console.log('Checking permissions for user:', userId);
    
    const { data, error } = await supabase.rpc('is_global_admin', {
      user_uuid: userId
    });
    
    if (error) {
      console.error('❌ Error checking global admin permissions:', error);
      return false;
    }
    
    console.log('✅ Global admin check result:', data);
    return data || false;
    
  } catch (error) {
    console.error('❌ Error in permission service:', error);
    return false;
  }
};