
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

  useEffect(() => {
    console.log('AuthProvider effect running');
    let mounted = true;

    // Configure authentication state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession ? 'Session exists' : 'No session');
        if (!mounted) return;
        
        // Handle different authentication events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (mounted) {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            setIsLoading(false);
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
            setIsLoading(false);
          }
          
          console.log('User signed out - redirecting to home');
        } else if (event === 'USER_UPDATED') {
          if (mounted) {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            setIsLoading(false);
          }
        } else if (event === 'INITIAL_SESSION') {
          if (mounted) {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            setIsLoading(false);
          }
        }
      }
    );

    // Then check for existing session
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        console.log('Current session check:', currentSession ? 'Exists' : 'None', error ? `Error: ${error.message}` : '');
        
        if (error) {
          console.error('Session check error:', error);
          // Clear potentially corrupted session
          await supabase.auth.signOut();
          if (mounted) {
            setSession(null);
            setUser(null);
            setIsLoading(false);
          }
          return;
        }
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('🚪 Starting logout process...');
    
    try {
      setIsLoading(true);
      
      // Clear local state first
      setUser(null);
      setSession(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Error during logout:', error);
        toast({
          title: "Erro ao sair",
          description: "Não foi possível desconectar. Tente novamente.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('✅ Successfully signed out from Supabase');
      
      // Clear any additional local storage items if needed
      localStorage.removeItem('cardioflow-auth');
      
      // Force redirect to home page
      window.location.href = '/';
      
    } catch (error) {
      console.error('❌ Exception during logout:', error);
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro inesperado ao tentar sair.",
        variant: "destructive",
      });
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
