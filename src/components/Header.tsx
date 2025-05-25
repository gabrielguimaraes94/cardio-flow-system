
import React, { useState, useEffect } from 'react';
import { User, Bell, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ClinicSwitcher } from './ClinicSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '@/types/profile';
import { SidebarTrigger } from '@/components/ui/sidebar';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { selectedClinic, refetchClinics } = useClinic();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  // Fetch user profile whenever user changes
  useEffect(() => {
    if (user) {
      const getProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data && !error) {
          // Transform database profile to match UserProfile type
          const userProfile: UserProfile = {
            id: data.id,
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
            phone: data.phone,
            crm: data.crm,
            title: data.title,
            bio: data.bio,
            role: data.role
          };
          
          setProfile(userProfile);
        }
      };
      
      getProfile();
    }
  }, [user]);

  // Refresh clinics list when component mounts
  useEffect(() => {
    if (user) {
      refetchClinics();
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = profile ? `${profile.firstName} ${profile.lastName}` : 'Usuário';

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-8 w-8 text-gray-600 hover:text-cardio-600 hover:bg-gray-100 rounded-lg transition-colors" />
          <ClinicSwitcher />
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="relative h-9 w-9 text-gray-600 hover:text-cardio-600 hover:bg-gray-100 rounded-lg">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-9 px-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-r from-cardio-500 to-cardio-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:flex items-center gap-1">
                  <span className="text-sm font-medium">{displayName}</span>
                  <ChevronDown className="h-3 w-3" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
