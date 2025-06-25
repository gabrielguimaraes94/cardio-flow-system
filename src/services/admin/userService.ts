import { supabase } from '@/integrations/supabase/client';
import { AdminUser, UserFilters } from './types';

export const getAllUsers = async (filters?: UserFilters): Promise<AdminUser[]> => {
  try {
    console.log('=== FETCHING ALL USERS ===');
    
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (filters?.role) {
      query = query.eq('role', filters.role);
    }
    
    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }
    
    console.log('✅ Users found:', data?.length || 0);
    return data || [];
    
  } catch (error) {
    console.error('❌ Error in user service:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    console.log('=== DELETING USER ===');
    console.log('User ID:', userId);
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
    
    console.log('✅ User deleted successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error in user deletion:', error);
    throw error;
  }
};