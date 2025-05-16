
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

    // Verificar se já existe uma sessão ativa primeiro
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Current session check:', currentSession ? 'Exists' : 'None');
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          // Mantemos isLoading como true até que o listener seja configurado
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Configurar listener de mudança de estado de autenticação
    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, currentSession) => {
          console.log('Auth state changed:', event);
          if (!mounted) return;
          
          if (currentSession !== session) {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
          }
          
          if (!authChangeProcessed) {
            setAuthChangeProcessed(true);
          }
          
          setIsLoading(false);
          
          if (event === 'SIGNED_IN') {
            toast({
              title: "Login bem-sucedido",
              description: "Bem-vindo de volta!",
            });
          } else if (event === 'SIGNED_OUT') {
            toast({
              title: "Desconectado",
              description: "Você foi desconectado com sucesso.",
            });
          }
        }
      );

      return subscription;
    };

    // Execute verificação de sessão e configuração do listener
    checkSession();
    const subscription = setupAuthListener();
    setIsLoading(false);

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast, authChangeProcessed]);

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
