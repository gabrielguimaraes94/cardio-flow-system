
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [authChangeProcessed, setAuthChangeProcessed] = useState(false);

  useEffect(() => {
    console.log('AuthProvider effect running');
    let mounted = true;

    // Configure authentication state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        if (!mounted) return;
        
        // Handle different authentication events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (mounted) {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
          }
          
          if (event === 'SIGNED_IN') {
            toast({
              title: "Login bem-sucedido",
              description: "Bem-vindo de volta!",
            });
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setSession(null);
            setUser(null);
          }
          
          toast({
            title: "Desconectado",
            description: "Você foi desconectado com sucesso.",
          });
        } else if (event === 'USER_UPDATED') {
          if (mounted) {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
          }
        }
        
        if (!authChangeProcessed && mounted) {
          setAuthChangeProcessed(true);
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      }
    );

    // Then check for existing session
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Current session check:', currentSession ? 'Exists' : 'None');
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  const signOut = async () => {
    console.log('Signing out...');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        toast({
          title: "Erro ao desconectar",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Successfully signed out');
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Exception during signOut:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = {
    user, 
    session, 
    isLoading, 
    signOut
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
