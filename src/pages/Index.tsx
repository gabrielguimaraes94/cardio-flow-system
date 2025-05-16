
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
    let isMounted = true;
    
    const checkUserAndRedirect = async () => {
      // If still loading or no user or redirection already attempted, do nothing
      if (isLoading || !user || redirectAttempted) return;
      
      if (isMounted) {
        setRedirectAttempted(true);
        console.log("Index: User authenticated, checking role before redirecting");
        
        try {
          setCheckingAdminStatus(true);
          // Check if user is global admin
          const isAdmin = await isGlobalAdmin(user.id);
          
          if (isAdmin && isMounted) {
            console.log("User is global admin, redirecting to admin dashboard");
            navigate('/admin/dashboard', { replace: true });
          } else if (isMounted) {
            console.log("User is not global admin, redirecting to dashboard");
            navigate('/dashboard', { replace: true });
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          if (isMounted) {
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
  }, [user, isLoading, navigate, redirectAttempted]);

  // Show loading indicator during initial loading
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
