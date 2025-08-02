import { supabase } from '@/integrations/supabase/client';
import { getTableData, getAllProfiles, getAllClinics, getAllClinicStaff } from './adminDataService';

export const debugUserConsistency = async () => {
  console.log('=== COMPLETE USER DEBUG (NEW VERSION) ===');
  
  try {
    console.log('1. CHECKING AUTH.USERS...');
    const { data: authUsers, error: authError } = await supabase
      .rpc('debug_get_auth_users');
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
    } else {
      console.log(`✅ Total auth users: ${authUsers?.length || 0}`);
      console.log('📋 First 3 auth users:', authUsers?.slice(0, 3));
    }

    console.log('2. CHECKING PROFILES (NEW SERVICE)...');
    try {
      const profiles = await getAllProfiles();
      console.log(`✅ Total profiles: ${profiles?.length || 0}`);
      console.log('📋 First 3 profiles:', profiles?.slice(0, 3));
    } catch (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    }

    console.log('3. CHECKING CURRENT USER...');
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('👤 Current user:', user.id);
      console.log('📧 Email:', user.email);
      
      const { data: roleFromFunction, error: roleError } = await supabase
        .rpc('get_current_user_role');
      
      if (roleError) {
        console.error('❌ Error calling get_current_user_role:', roleError);
      } else {
        console.log('🔧 Role via function:', roleFromFunction);
      }
    }

    console.log('4. CHECKING CLINICS (NEW SERVICE)...');
    try {
      const clinics = await getAllClinics();
      console.log(`✅ Total clinics: ${clinics?.length || 0}`);
      console.log('📋 Clinics found:', clinics?.slice(0, 3));
    } catch (clinicsError) {
      console.error('❌ Error fetching clinics:', clinicsError);
    }

    console.log('5. CHECKING CLINIC_STAFF (NEW SERVICE)...');
    try {
      const clinicStaff = await getAllClinicStaff();
      console.log(`✅ Total clinic_staff: ${clinicStaff?.length || 0}`);
      console.log('📋 Clinic staff found:', clinicStaff?.slice(0, 3));
    } catch (staffError) {
      console.error('❌ Error fetching clinic_staff:', staffError);  
    }

    console.log('6. TESTING GENERIC FUNCTION...');
    const tablesToTest: Array<'profiles' | 'clinics' | 'clinic_staff' | 'patients'> = ['profiles', 'clinics', 'clinic_staff', 'patients'];
    
    for (const table of tablesToTest) {
      try {
        console.log(`6.${tablesToTest.indexOf(table) + 1}. Testing table ${table}...`);
        const data = await getTableData(table, 5);
        console.log(`✅ ${table}: ${data?.length || 0} records`);
      } catch (error) {
        console.error(`❌ Error in table ${table}:`, error);
      }
    }

  } catch (error) {
    console.error('❌ GENERAL ERROR in debug:', error);
  }
};

export const debugAuthUsers = async () => {
  try {
    console.log('=== TESTING DEBUG_GET_AUTH_USERS FUNCTION ===');
    
    const { data, error } = await supabase.rpc('debug_get_auth_users');
    
    if (error) {
      console.error('❌ Error in debug_get_auth_users function:', error);
      return { authUsers: [], error };
    }
    
    console.log('✅ debug_get_auth_users function worked!');
    console.log('Auth users returned:', data?.length || 0);
    
    data?.forEach((user, index) => {
      console.log(`Auth User ${index + 1}:`, {
        id: user.user_id,
        email: user.email,
        created_at: user.created_at
      });
    });
    
    return { authUsers: data || [], error: null };
    
  } catch (error) {
    console.error('❌ Error executing debug_get_auth_users:', error);
    return { authUsers: [], error };
  }
};

export const syncMissingProfiles = async () => {
  try {
    console.log('=== SYNCING MISSING PROFILES ===');
    
    const { data, error } = await supabase.rpc('sync_missing_profiles');
    
    if (error) {
      console.error('❌ Error in sync:', error);
      throw error;
    }
    
    console.log('✅ Sync completed!');
    console.log('Profiles synced:', data?.length || 0);
    
    data?.forEach((syncedUser, index) => {
      console.log(`Synced profile ${index + 1}:`, {
        user_id: syncedUser.user_id,
        email: syncedUser.email,
        action: syncedUser.action
      });
    });
    
    return data || [];
    
  } catch (error) {
    console.error('❌ Error syncing profiles:', error);
    throw error;
  }
};

export const getClinicStaffData = async () => {
  try {
    console.log('=== FETCHING CLINIC_STAFF DATA ===');
    
    const { data, error } = await supabase
      .from('clinic_staff')
      .select(`
        *,
        clinics:clinic_id(name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching clinic staff:', error);
      console.error('Details:', JSON.stringify(error, null, 2));
      return { clinicStaff: [], error };
    }
    
    console.log('✅ Clinic staff found:', data?.length || 0);
    console.log('📋 Detailed data:', data);
    
    const mappedData = data?.map(staff => ({
      ...staff,
      clinic_name: staff.clinics?.name || 'N/A'
    })) || [];
    
    return { clinicStaff: mappedData, error: null };
    
  } catch (error) {
    console.error('❌ Error fetching clinic staff:', error);
    return { clinicStaff: [], error };
  }
};

export const testPermissions = async () => {
  try {
    console.log('=== TESTING SPECIFIC PERMISSIONS ===');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('❌ User not authenticated');
      return;
    }
    
    console.log('👤 Testing for user:', user.id, user.email);
    
    console.log('1. Testing get_current_user_role...');
    const { data: role, error: roleError } = await supabase.rpc('get_current_user_role');
    
    if (roleError) {
      console.error('❌ Error get_current_user_role:', roleError);
    } else {
      console.log('✅ Current role:', role);
    }
    
    console.log('2. Checking profile directly...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
    } else {
      console.log('✅ Profile found:', profile);
    }
    
    console.log('3. Testing clinics query...');
    const { data: clinicsTest, error: clinicsTestError } = await supabase
      .from('clinics')
      .select('id, name, active, created_by')
      .limit(5);
    
    if (clinicsTestError) {
      console.error('❌ Error testing clinics:', clinicsTestError);
    } else {
      console.log('✅ Clinics in test:', clinicsTest);
    }
    
    console.log('4. Testing clinic_staff query...');
    const { data: staffTest, error: staffTestError } = await supabase
      .from('clinic_staff')
      .select('id, user_id, clinic_id, is_admin, active, role')
      .limit(5);
    
    if (staffTestError) {
      console.error('❌ Error testing clinic_staff:', staffTestError);
    } else {
      console.log('✅ Clinic staff in test:', staffTest);
    }
    
  } catch (error) {
    console.error('❌ General error in permissions test:', error);
  }
};