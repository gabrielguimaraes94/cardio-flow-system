
import React, { useState, useEffect } from 'react';
import { User, Bell, ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ClinicSwitcher } from './ClinicSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '@/types/profile';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, sidebarOpen }) => {
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
    <header className="sticky top-0 z-30 w-full border-b bg-white">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="h-8 w-8 md:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <ClinicSwitcher />
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-8 px-2">
                <div className="h-6 w-6 rounded-full bg-cardio-500 flex items-center justify-center">
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
