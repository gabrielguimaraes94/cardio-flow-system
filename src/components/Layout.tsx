
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ClinicProvider } from '@/contexts/ClinicContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ClinicProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <Sidebar />
            <div className="flex-1 flex flex-col w-full">
              <Header />
              <main className="flex-1 p-6 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </ClinicProvider>
    </div>
  );
};
