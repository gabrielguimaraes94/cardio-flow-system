import { supabase } from '@/integrations/supabase/client';
import { AdminUser, AdminClinic } from './types';

type TableNames = 'profiles' | 'clinics' | 'clinic_staff' | 'patients' | 'anamnesis' | 'angioplasty_requests' | 'insurance_companies' | 'insurance_audit_rules' | 'insurance_contracts' | 'insurance_form_configs' | 'patient_addresses' | 'procedure_multiplication_factors';

export const getTableData = async (tableName: TableNames, limit?: number) => {
  try {
    console.log(`=== FETCHING DATA FROM TABLE: ${tableName} ===`);
    
    let query = supabase.from(tableName).select('*');
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`❌ Error fetching ${tableName}:`, error);
      throw error;
    }
    
    console.log(`✅ Found ${data?.length || 0} records in ${tableName}`);
    return data || [];
    
  } catch (error) {
    console.error(`❌ Error in getTableData for ${tableName}:`, error);
    throw error;
  }
};

export const getAllProfiles = async () => {
  try {
    console.log('=== FETCHING ALL PROFILES (ADMIN) ===');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching profiles:', error);
      throw error;
    }
    
    console.log('✅ Profiles found:', data?.length || 0);
    return data || [];
    
  } catch (error) {
    console.error('❌ Error in profiles service:', error);
    throw error;
  }
};

export const getAllClinics = async (): Promise<AdminClinic[]> => {
  try {
    console.log('=== FETCHING ALL CLINICS (ADMIN) ===');
    
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching clinics:', error);
      throw error;
    }
    
    console.log('✅ Clinics found:', data?.length || 0);
    return data || [];
    
  } catch (error) {
    console.error('❌ Error in clinics service:', error);
    throw error;
  }
};

export const getAllClinicStaff = async () => {
  try {
    console.log('=== FETCHING ALL CLINIC_STAFF (ADMIN) ===');
    
    const { data, error } = await supabase
      .from('clinic_staff')
      .select(`
        *,
        profiles:user_id (
          id,
          first_name,
          last_name,
          email,
          role
        ),
        clinics:clinic_id (
          id,
          name,
          city
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching clinic_staff:', error);
      throw error;
    }
    
    console.log('✅ Clinic staff found:', data?.length || 0);
    return data || [];
    
  } catch (error) {
    console.error('❌ Error in clinic_staff service:', error);
    throw error;
  }
};

export const getAllPatients = async () => {
  try {
    console.log('=== FETCHING ALL PATIENTS (ADMIN) ===');
    
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching patients:', error);
      throw error;
    }
    
    console.log('✅ Patients found:', data?.length || 0);
    return data || [];
    
  } catch (error) {
    console.error('❌ Error in patients service:', error);
    throw error;
  }
};

export const createRecord = async (tableName: TableNames, data: any) => {
  try {
    console.log(`=== CREATING RECORD IN TABLE: ${tableName} ===`);
    console.log('Data:', data);
    
    const { data: result, error } = await supabase
      .from(tableName)
      .insert([data])
      .select()
      .single();
    
    if (error) {
      console.error(`❌ Error creating record in ${tableName}:`, error);
      throw error;
    }
    
    console.log(`✅ Record created in ${tableName}:`, result);
    return result;
    
  } catch (error) {
    console.error(`❌ Error in creation service ${tableName}:`, error);
    throw error;
  }
};

export const updateRecord = async (tableName: TableNames, id: string, data: any) => {
  try {
    console.log(`=== UPDATING RECORD IN TABLE: ${tableName} ===`);
    console.log('ID:', id);
    console.log('Data:', data);
    
    const { data: result, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`❌ Error updating record in ${tableName}:`, error);
      throw error;
    }
    
    console.log(`✅ Record updated in ${tableName}:`, result);
    return result;
    
  } catch (error) {
    console.error(`❌ Error in update service ${tableName}:`, error);
    throw error;
  }
};

export const deleteRecord = async (tableName: TableNames, id: string) => {
  try {
    console.log(`=== DELETING RECORD IN TABLE: ${tableName} ===`);
    console.log('ID:', id);
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`❌ Error deleting record in ${tableName}:`, error);
      throw error;
    }
    
    console.log(`✅ Record deleted in ${tableName}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error in deletion service ${tableName}:`, error);
    throw error;
  }
};