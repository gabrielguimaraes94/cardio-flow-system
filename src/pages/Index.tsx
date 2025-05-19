
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
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [checkingAdminStatus, setCheckingAdminStatus] = useState(false);
  const [loadingState, setLoadingState] = useState<string>("Verificando autenticação...");

  useEffect(() => {
    let isMounted = true;
    
    const checkUserAndRedirect = async () => {
      // If still loading or redirection already attempted, do nothing
      if (authLoading || clinicsLoading || !user || redirectAttempted) return;
      
      if (isMounted) {
        setRedirectAttempted(true);
        console.log("Index: User authenticated, checking role before redirecting");
        
        try {
          setCheckingAdminStatus(true);
          setLoadingState("Verificando permissões...");
          // Check if user is global admin
          const isAdmin = await isGlobalAdmin(user.id);
          
          if (isAdmin && isMounted) {
            console.log("User is global admin, redirecting to admin dashboard");
            setLoadingState("Redirecionando para o painel administrativo...");
            navigate('/admin/dashboard', { replace: true });
          } else if (userClinics.length === 0 && isMounted) {
            console.log("User has no clinics, showing no access page");
            setLoadingState("Verificando acesso às clínicas...");
            navigate('/no-access', { replace: true });
          } else if (isMounted) {
            console.log("User has clinics, redirecting to dashboard");
            setLoadingState("Redirecionando para o dashboard...");
            navigate('/dashboard', { replace: true });
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          if (isMounted) {
            setLoadingState("Ocorreu um erro, redirecionando...");
            // In case of error, redirect to default dashboard
            navigate('/dashboard', { replace: true });
          }
        } finally {
          if (isMounted) {
            setCheckingAdminStatus(false);
          }
        }
      }
    };
    
    checkUserAndRedirect();
    
    return () => {
      isMounted = false;
    };
  }, [user, authLoading, clinicsLoading, userClinics, navigate, redirectAttempted]);

  // Show loading indicator during initial loading
  if (authLoading || clinicsLoading || checkingAdminStatus) {
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
