
import { Building, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const NoAccess = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Building className="mx-auto h-12 w-12 text-cardio-500 mb-2" />
          <CardTitle className="text-2xl">Sem acesso a clínicas</CardTitle>
          <CardDescription>
            Sua conta não está associada a nenhuma clínica no momento.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {user?.email ? (
              <>
                Sua conta <span className="font-medium">{user.email}</span> foi registrada com sucesso, 
                mas você ainda não tem acesso a nenhuma clínica no sistema.
              </>
            ) : (
              'Sua conta foi registrada com sucesso, mas você ainda não tem acesso a nenhuma clínica no sistema.'
            )}
          </p>
          <div className="bg-blue-50 rounded-md p-4 text-left">
            <div className="flex items-start">
              <MailCheck className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800 mb-1">O que fazer agora?</h3>
                <p className="text-sm text-blue-700">
                  Entre em contato com o administrador da clínica para que ele possa associar sua conta.
                  Alternativamente, se você é um médico e deseja criar sua própria clínica, você pode se 
                  cadastrar como administrador de clínica.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={handleLogout}>
            Sair do sistema
          </Button>
          <Button variant="default" onClick={() => navigate('/admin/login')}>
            Cadastrar como administrador
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NoAccess;
