
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { isGlobalAdmin } from "@/services/adminService";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [checkingAdminStatus, setCheckingAdminStatus] = useState(false);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      // Se ainda está carregando ou não tem usuário ou já tentamos redirecionar, não fazemos nada
      if (isLoading || !user || redirectAttempted) return;
      
      setRedirectAttempted(true);
      console.log("Index: User authenticated, checking role before redirecting");
      
      try {
        setCheckingAdminStatus(true);
        // Verificar se o usuário é admin global
        const isAdmin = await isGlobalAdmin(user.id);
        
        if (isAdmin) {
          console.log("User is global admin, redirecting to admin dashboard");
          navigate('/admin/dashboard');
        } else {
          console.log("User is not global admin, redirecting to dashboard");
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        // Em caso de erro, redirecionamos para o dashboard padrão
        navigate('/dashboard');
      } finally {
        setCheckingAdminStatus(false);
      }
    };
    
    checkUserAndRedirect();
  }, [user, isLoading, navigate, redirectAttempted]);

  // Mostra o indicador de carregamento durante o carregamento inicial
  if (isLoading || checkingAdminStatus) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cardio-500 mb-4" />
        <div className="text-cardio-500 text-xl">
          {isLoading ? "Verificando autenticação..." : "Preparando seu ambiente..."}
        </div>
      </div>
    );
  }

  // Se não estiver carregando e não houver usuário, mostra o formulário de login
  if (!user) {
    return <LoginForm />;
  }

  // Este estado só deve ser alcançado brevemente durante o redirecionamento
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-cardio-500 mb-4" />
      <div className="text-cardio-500 text-xl">Redirecionando...</div>
    </div>
  );
};

export default Index;
