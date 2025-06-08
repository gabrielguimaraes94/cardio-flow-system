
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";
import { useMe } from "@/hooks/useMe";
import { isGlobalAdmin } from "@/services/admin";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, userClinics, isLoading } = useMe();
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirect = async () => {
      console.log("Index: Estado atual - isLoading:", isLoading, "user:", !!user, "userClinics.length:", userClinics.length);
      
      // Se ainda está carregando, espera
      if (isLoading) {
        console.log("Index: Aguardando carregamento...");
        return;
      }
      
      // Se não há usuário, mostra login
      if (!user) {
        console.log("Index: Usuário não autenticado, mostrando login");
        return;
      }

      console.log("Index: Processando redirecionamento para usuário autenticado");
      console.log("Index: userClinics:", userClinics);

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
  }, [user, isLoading, userClinics, navigate]);

  // Mostra loading quando necessário
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cardio-500 mb-4" />
        <div className="text-cardio-500 text-xl">Carregando...</div>
      </div>
    );
  }

  // Se não há usuário, mostra login
  if (!user) {
    return <LoginForm />;
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
