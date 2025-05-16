
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileX2, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-red-50 p-4 rounded-full">
            <FileX2 className="h-16 w-16 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-2 text-gray-900">404</h1>
        <h2 className="text-2xl font-medium text-gray-800 mb-4">Página não encontrada</h2>
        
        <p className="text-gray-600 mb-8">
          A página <span className="font-medium text-red-600">{location.pathname}</span> não existe ou foi removida.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={goBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <Button 
            className="flex items-center gap-2 bg-cardio-500 hover:bg-cardio-600" 
            onClick={goHome}
          >
            <Home className="h-4 w-4" />
            Página inicial
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
