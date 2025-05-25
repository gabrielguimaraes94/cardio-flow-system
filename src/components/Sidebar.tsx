
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Users, Heart, FileText, Calendar, Settings, LogOut, Menu, BarChart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: Heart },
    { title: "Pacientes", url: "/patients", icon: Users },
    { title: "Cateterismo", url: "/catheterization", icon: FileText },
    { title: "Angioplastia", url: "/angioplasty", icon: FileText },
    { title: "Relatórios", url: "/reports", icon: BarChart },
    { title: "Agenda", url: "/schedule", icon: Calendar },
    { title: "Configurações", url: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado com segurança.",
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Não foi possível desconectar. Tente novamente.",
      });
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          "md:relative md:z-auto",
          isOpen ? "w-64" : "w-16",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-cardio-500 flex-shrink-0" />
            {isOpen && (
              <h1 className="text-xl font-bold text-gray-900">CardioFlow</h1>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 flex-shrink-0"
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.url || 
                (item.url !== '/dashboard' && location.pathname.startsWith(item.url));
              
              return (
                <li key={item.title}>
                  <Link
                    to={item.url}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      "hover:bg-gray-100",
                      isActive 
                        ? "bg-cardio-100 text-cardio-700 font-medium" 
                        : "text-gray-700",
                      !isOpen && "justify-center"
                    )}
                    title={!isOpen ? item.title : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {isOpen && <span className="truncate">{item.title}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer - Logout */}
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full",
              "hover:bg-red-50 text-red-600",
              !isOpen && "justify-center"
            )}
            title={!isOpen ? 'Sair' : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {isOpen && <span className="truncate">Sair</span>}
          </button>
        </div>
      </div>
    </>
  );
};
