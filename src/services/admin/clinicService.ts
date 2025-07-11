import { supabase } from '@/integrations/supabase/client';
import { AdminClinic, RegisterClinicRequest, CreateClinicParams } from './types';

export const registerClinic = async (clinicData: RegisterClinicRequest, createdBy: string) => {
  try {
    console.log('=== REGISTERING NEW CLINIC ===');
    console.log('Clinic data:', clinicData);
    
    const params: CreateClinicParams = {
      p_name: clinicData.name,
      p_city: clinicData.city,
      p_address: clinicData.address,
      p_phone: clinicData.phone,
      p_email: clinicData.email,
      p_created_by: createdBy,
      p_trading_name: clinicData.trading_name,
      p_cnpj: clinicData.cnpj
    };
    
    const { data, error } = await supabase.rpc('create_clinic', params);
    
    if (error) {
      console.error('❌ Error registering clinic:', error);
      throw error;
    }
    
    console.log('✅ Clinic registered successfully:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Error in clinic registration:', error);
    throw error;
  }
};

export const updateClinicStatus = async (clinicId: string, active: boolean): Promise<AdminClinic> => {
  try {
    console.log('=== UPDATING CLINIC STATUS ===');
    console.log('Clinic ID:', clinicId);
    console.log('New status:', active);
    
    const { data, error } = await supabase
      .from('clinics')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', clinicId)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating clinic status:', error);
      throw error;
    }
    
    console.log('✅ Clinic status updated successfully');
    return data;
    
  } catch (error) {
    console.error('❌ Error in clinic status update:', error);
    throw error;
  }
};

export const deleteClinic = async (clinicId: string): Promise<boolean> => {
  try {
    console.log('=== DELETING CLINIC ===');
    console.log('Clinic ID:', clinicId);
    
    const { error } = await supabase
      .from('clinics')
      .delete()
      .eq('id', clinicId);
    
    if (error) {
      console.error('❌ Error deleting clinic:', error);
      throw error;
    }
    
    console.log('✅ Clinic deleted successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error in clinic deletion:', error);
    throw error;
  }
};