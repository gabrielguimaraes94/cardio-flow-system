
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { useStaffClinic } from "@/contexts/StaffClinicContext";
import { isGlobalAdmin } from "@/services/adminService";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { loading: clinicsLoading, userClinics } = useStaffClinic();
  const navigate = useNavigate();
  const [redirectProcessed, setRedirectProcessed] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Verificando autenticação...");

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const processRedirect = async () => {
      // Se já processou redirecionamento, não faz nada
      if (redirectProcessed) {
        return;
      }

      // Aguarda auth e clinics carregarem
      if (authLoading || clinicsLoading) {
        return;
      }

      // Se não há usuário, mostra login
      if (!user) {
        console.log("Index: No user found, showing login form");
        setLoadingMessage("");
        return;
      }

      // Marca que está processando para evitar múltiplas execuções
      setRedirectProcessed(true);
      console.log("Index: Processing redirect for authenticated user");

      try {
        setLoadingMessage("Verificando permissões...");
        
        // Verifica se é admin global com timeout
        const isAdmin = await Promise.race([
          isGlobalAdmin(user.id),
          new Promise<boolean>((_, reject) => 
            setTimeout(() => reject(new Error('Admin check timeout')), 3000)
          )
        ]);

        if (!isMounted) return;

        if (isAdmin) {
          console.log("Index: User is global admin, redirecting to admin dashboard");
          setLoadingMessage("Redirecionando para painel administrativo...");
          navigate('/admin/dashboard', { replace: true });
          return;
        }

        // Se não é admin, verifica as clínicas
        console.log("Index: User clinics count:", userClinics.length);
        
        if (userClinics.length === 0) {
          console.log("Index: No clinics found, redirecting to no-access");
          setLoadingMessage("Sem acesso a clínicas...");
          navigate('/no-access', { replace: true });
        } else {
          console.log("Index: User has clinics, redirecting to dashboard");
          setLoadingMessage("Redirecionando para dashboard...");
          navigate('/dashboard', { replace: true });
        }

      } catch (error) {
        console.error("Index: Error during redirect process:", error);
        
        if (!isMounted) return;
        
        // Em caso de erro, usa fallback baseado nas clínicas carregadas
        if (userClinics.length > 0) {
          console.log("Index: Error occurred but user has clinics, redirecting to dashboard");
          navigate('/dashboard', { replace: true });
        } else {
          console.log("Index: Error occurred and no clinics, redirecting to no-access");
          navigate('/no-access', { replace: true });
        }
      }
    };

    // Executa após um pequeno delay para garantir que todos os contexts estão prontos
    timeoutId = setTimeout(() => {
      processRedirect();
    }, 100);

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user, authLoading, clinicsLoading, userClinics, navigate, redirectProcessed]);

  // Reseta o estado de redirecionamento se o usuário mudar
  useEffect(() => {
    setRedirectProcessed(false);
  }, [user?.id]);

  // Loading durante verificações iniciais ou processamento de redirecionamento
  if (authLoading || clinicsLoading || (user && !redirectProcessed)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cardio-500 mb-4" />
        <div className="text-cardio-500 text-xl">
          {loadingMessage}
        </div>
      </div>
    );
  }

  // Se não há usuário e não está carregando, mostra login
  if (!user) {
    return <LoginForm />;
  }

  // Estado temporário durante redirecionamento
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-cardio-500 mb-4" />
      <div className="text-cardio-500 text-xl">Redirecionando...</div>
    </div>
  );
};

export default Index;
