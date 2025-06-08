
import { useEffect } from "react";
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

  useEffect(() => {
    const handleRedirect = async () => {
      // Se ainda está carregando auth, espera
      if (authLoading) return;
      
      // Se não há usuário, mostra login
      if (!user) return;

      // Se ainda está carregando clínicas, espera
      if (clinicsLoading) return;

      console.log("Index: Processando redirecionamento para usuário autenticado");
      console.log("Index: userClinics:", userClinics);
      console.log("Index: userClinics.length:", userClinics.length);

      try {
        // Verifica se é admin global (com timeout rápido)
        const isAdmin = await Promise.race([
          isGlobalAdmin(user.id),
          new Promise<boolean>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 1500)
          )
        ]);

        if (isAdmin) {
          console.log("Index: Redirecionando admin para dashboard administrativo");
          navigate('/admin/dashboard', { replace: true });
          return;
        }
      } catch (error) {
        console.log("Index: Erro ou timeout na verificação de admin, continuando como usuário normal");
      }

      // Para usuários normais, verifica clínicas
      if (userClinics.length > 0) {
        console.log("Index: Usuário tem clínicas, redirecionando para dashboard");
        navigate('/dashboard', { replace: true });
      } else {
        console.log("Index: Usuário sem clínicas, redirecionando para no-access");
        navigate('/no-access', { replace: true });
      }
    };

    handleRedirect();
  }, [user, authLoading, clinicsLoading, userClinics, navigate]);

  // Mostra loading apenas quando necessário
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cardio-500 mb-4" />
        <div className="text-cardio-500 text-xl">Verificando autenticação...</div>
      </div>
    );
  }

  // Se não há usuário, mostra login
  if (!user) {
    return <LoginForm />;
  }

  // Mostra loading apenas durante carregamento de clínicas
  if (clinicsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cardio-500 mb-4" />
        <div className="text-cardio-500 text-xl">Carregando clínicas...</div>
      </div>
    );
  }

  // Loading final rápido durante redirecionamento
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-cardio-500 mb-4" />
      <div className="text-cardio-500 text-xl">Redirecionando...</div>
    </div>
  );
};

export default Index;
