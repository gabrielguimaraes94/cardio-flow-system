
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-slate-800 text-white px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">CardioFlow</h1>
            <span className="text-sm bg-blue-600 px-2 py-0.5 rounded">Admin</span>
          </div>
          {user && (
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:text-white hover:bg-slate-700">
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </Button>
          )}
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
      
      <footer className="bg-slate-800 text-white py-4 px-6">
        <div className="container mx-auto text-sm text-center">
          CardioFlow Admin © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};
