
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/profile';

export const fetchUsers = async (clinicId?: string): Promise<UserProfile[]> => {
  try {
    console.log('Fetching users, clinicId:', clinicId);
    
    let query = supabase
      .from('profiles')
      .select('*');
      
    // If we have a clinicId, we would filter by it, but for now we just get all users
    // In a real implementation, we would need a users_clinics relation table
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    console.log('Fetched users:', data);
    
    return data.map((user: any) => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      crm: user.crm,
      title: user.title || '',
      bio: user.bio || '',
      role: user.role
    }));
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    throw error;
  }
};

// Add function to create a new user (this would typically be an admin invitation)
export const inviteUser = async (userData: Omit<UserProfile, 'id'>) => {
  try {
    // In a real application, this would involve:
    // 1. Creating a user in Auth
    // 2. Setting up their profile
    // 3. Sending an email invitation
    
    // This is a placeholder - in a real app you'd use Supabase's invite functionality
    console.log('Inviting new user:', userData);
    
    // Return a mock response
    return {
      id: `invited-${Date.now()}`,
      ...userData
    };
  } catch (error) {
    console.error('Error inviting user:', error);
    throw error;
  }
};

// Update an existing user
export const updateUser = async (userData: UserProfile) => {
  try {
    console.log('Updating user:', userData);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        crm: userData.crm,
        phone: userData.phone,
        title: userData.title,
        bio: userData.bio,
        role: userData.role
      })
      .eq('id', userData.id);
    
    if (error) throw error;
    
    return userData;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (userId: string) => {
  try {
    console.log('Deleting user:', userId);
    
    // In a real application, this would involve removing the user from Auth
    // For now we just remove their profile
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
