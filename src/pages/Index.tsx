
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
  const [checkingRedirect, setCheckingRedirect] = useState(false);
  const [loadingState, setLoadingState] = useState<string>("Verificando autenticação...");

  useEffect(() => {
    let isMounted = true;
    
    const checkUserAndRedirect = async () => {
      // Wait for auth and clinics to finish loading
      if (authLoading || clinicsLoading) {
        return;
      }

      // If no user, stay on login page
      if (!user) {
        console.log("Index: No user found, showing login form");
        setLoadingState("");
        return;
      }

      // Prevent multiple redirect attempts
      if (checkingRedirect) {
        return;
      }

      if (isMounted) {
        setCheckingRedirect(true);
        console.log("Index: User authenticated, checking role before redirecting");
        
        try {
          setLoadingState("Verificando permissões...");
          
          // Check if user is global admin with timeout
          const adminCheckPromise = isGlobalAdmin(user.id);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Admin check timeout')), 5000)
          );
          
          const isAdmin = await Promise.race([adminCheckPromise, timeoutPromise]) as boolean;
          
          if (!isMounted) return;
          
          if (isAdmin) {
            console.log("User is global admin, redirecting to admin dashboard");
            setLoadingState("Redirecionando para o painel administrativo...");
            navigate('/admin/dashboard', { replace: true });
          } else if (userClinics.length === 0) {
            console.log("User has no clinics, showing no access page");
            setLoadingState("Verificando acesso às clínicas...");
            navigate('/no-access', { replace: true });
          } else {
            console.log("User has clinics, redirecting to dashboard");
            setLoadingState("Redirecionando para o dashboard...");
            navigate('/dashboard', { replace: true });
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          if (isMounted) {
            setLoadingState("Ocorreu um erro, redirecionando...");
            // In case of error, redirect to default dashboard if user has clinics
            if (userClinics.length > 0) {
              navigate('/dashboard', { replace: true });
            } else {
              navigate('/no-access', { replace: true });
            }
          }
        } finally {
          if (isMounted) {
            setCheckingRedirect(false);
          }
        }
      }
    };
    
    checkUserAndRedirect();
    
    return () => {
      isMounted = false;
    };
  }, [user, authLoading, clinicsLoading, userClinics, navigate, checkingRedirect]);

  // Show loading indicator during initial loading or redirect checking
  if (authLoading || clinicsLoading || checkingRedirect) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cardio-500 mb-4" />
        <div className="text-cardio-500 text-xl">
          {loadingState}
        </div>
      </div>
    );
  }

  // If not loading and no user, show login form
  if (!user) {
    return <LoginForm />;
  }

  // This state should only be reached briefly during redirection
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-cardio-500 mb-4" />
      <div className="text-cardio-500 text-xl">Redirecionando...</div>
    </div>
  );
};

export default Index;
