import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { 
  isGlobalAdmin, 
  getAllClinics,
  getAllUsers, 
  AdminClinic, 
  AdminUser
} from '@/services/admin';
import { getAllProfiles, ProfileData } from '@/services/admin/profileService';
import { ProfilesTable } from '@/components/admin/dashboard/ProfilesTable';
import { AuthUsersTable } from '@/components/admin/dashboard/AuthUsersTable';
import { ClinicStaffTable } from '@/components/admin/dashboard/ClinicStaffTable';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, RefreshCw } from 'lucide-react';
import { RegisterTab } from '@/components/admin/dashboard/Tabs/RegisterTab';
import { ClinicsTab } from '@/components/admin/dashboard/Tabs/ClinicsTab';
import { UsersTab } from '@/components/admin/dashboard/Tabs/UsersTab';
import { Button } from '@/components/ui/button';
import { syncMissingProfiles, debugAuthUsers, getClinicStaffData } from '@/services/admin/debugUserService';
import { checkTriggerStatus, testTriggerExecution } from '@/services/admin/triggerService';

type UserRole = Database["public"]["Enums"]["user_role"];

interface AuthUser {
  auth_user_id: string;
  auth_email: string;
  auth_created_at: string;
  has_profile: boolean;
}

interface ClinicStaffMember {
  id: string;
  user_id: string;
  clinic_id: string;
  is_admin: boolean;
  active: boolean;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
    role: UserRole;
  };
  clinics?: {
    name: string;
    city: string;
  };
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [clinics, setClinics] = useState<AdminClinic[]>([]);
  const [clinicStaff, setClinicStaff] = useState<ClinicStaffMember[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      console.log('=== LOADING ADMIN DASHBOARD DATA ===');

      const [profilesData, authUsersData, clinicsData, clinicStaffData] = await Promise.allSettled([
        getAllProfiles(),
        debugAuthUsers(),
        getAllClinics(),
        getClinicStaffData()
      ]);

      if (profilesData.status === 'fulfilled') {
        console.log('✅ Profiles loaded:', profilesData.value.length);
        setProfiles(profilesData.value);
      } else {
        console.error('❌ Error loading profiles:', profilesData.reason);
        toast({
          title: "Error loading profiles",
          description: "Unable to load profile data.",
          variant: "destructive",
        });
      }

      if (authUsersData.status === 'fulfilled') {
        console.log('✅ Auth users loaded:', authUsersData.value.authUsers?.length || 0);
        setAuthUsers(authUsersData.value.authUsers || []);
      } else {
        console.error('❌ Error loading auth users:', authUsersData.reason);
        toast({
          title: "Error loading users",
          description: "Unable to load user data.",
          variant: "destructive",
        });
      }

      if (clinicsData.status === 'fulfilled') {
        console.log('✅ Clinics loaded:', clinicsData.value.length);
        setClinics(clinicsData.value);
      } else {
        console.error('❌ Error loading clinics:', clinicsData.reason);
        toast({
          title: "Error loading clinics",
          description: "Unable to load clinic data.",
          variant: "destructive",
        });
      }

      if (clinicStaffData.status === 'fulfilled') {
        console.log('✅ Clinic staff loaded:', clinicStaffData.value.clinicStaff?.length || 0);
        setClinicStaff(clinicStaffData.value.clinicStaff || []);
      } else {
        console.error('❌ Error loading clinic staff:', clinicStaffData.reason);
        toast({
          title: "Error loading staff",
          description: "Unable to load clinic staff data.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('❌ GENERAL ERROR LOADING DASHBOARD:', error);
      toast({
        title: "Dashboard error",
        description: "Unable to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    toast({
      title: "Data updated",
      description: "Dashboard updated successfully.",
    });
  };

  const handleSyncMissingProfiles = async () => {
    try {
      console.log('=== SYNCING MISSING PROFILES ===');
      await syncMissingProfiles();
      await loadData();
      toast({
        title: "Sync completed",
        description: "Missing profiles have been synchronized.",
      });
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync error",
        description: "Unable to synchronize profiles.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate('/admin/login');
        return;
      }

      try {
        const hasAccess = await isGlobalAdmin(user.id);
        if (!hasAccess) {
          toast({
            title: "Access denied",
            description: "You don't have permission to access the admin dashboard.",
            variant: "destructive",
          });
          navigate('/no-access');
          return;
        }

        await loadData();
      } catch (error) {
        console.error('Error checking access:', error);
        toast({
          title: "Access error",
          description: "Unable to verify your permissions.",
          variant: "destructive",
        });
        navigate('/no-access');
      }
    };

    checkAccess();
  }, [user, navigate, toast]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Administrative Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users, clinics and system settings
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleSyncMissingProfiles}
              variant="outline"
              size="sm"
            >
              <Users className="h-4 w-4 mr-2" />
              Sync Profiles
            </Button>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{authUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                {profiles.length} with complete profile
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clinics</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clinics.filter(c => c.active).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {clinics.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clinicStaff.filter(cs => cs.active).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {clinicStaff.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clinic Admins</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clinicStaff.filter(cs => cs.is_admin && cs.active).length}
              </div>
              <p className="text-xs text-muted-foreground">
                active administrators
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="clinics">Clinics</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UsersTab 
              onRefresh={loadData}
            />
          </TabsContent>

          <TabsContent value="clinics" className="space-y-4">
            <ClinicsTab 
              clinics={clinics}
            />
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <RegisterTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};