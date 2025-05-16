
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    // Só tentamos redirecionar uma vez para evitar loops
    if (!isLoading && user && !redirectAttempted) {
      console.log("Index: User authenticated, redirecting to dashboard");
      setRedirectAttempted(true);
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate, redirectAttempted]);

  // Mostra o indicador de carregamento apenas durante o carregamento inicial
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-cardio-500 text-xl">Carregando...</div>
      </div>
    );
  }

  // Se não estiver carregando e não houver usuário, mostra o formulário de login
  if (!user) {
    return <LoginForm />;
  }

  // Este estado só deve ser alcançado brevemente durante o redirecionamento
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-cardio-500 text-xl">Redirecionando...</div>
    </div>
  );
};

export default Index;
