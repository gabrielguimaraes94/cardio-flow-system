
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  return isLoading ? (
    <div className="flex items-center justify-center h-screen">
      <div className="text-cardio-500 text-xl">Carregando...</div>
    </div>
  ) : (
    <LoginForm />
  );
};

export default Index;
