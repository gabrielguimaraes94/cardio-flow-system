
import { Building, MailCheck, HelpCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const NoAccess = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Building className="mx-auto h-12 w-12 text-cardio-500 mb-2" />
          <CardTitle className="text-2xl">Sem acesso a clínicas</CardTitle>
          <CardDescription>
            Sua conta não está associada a nenhuma clínica no momento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600 text-center">
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
              <MailCheck className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-800 mb-1">O que fazer agora?</h3>
                <p className="text-sm text-blue-700">
                  Entre em contato com o administrador da clínica para que ele possa associar sua conta.
                </p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-start">
              <HelpCircle className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Como obter acesso?</h3>
                <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                  <li>Peça ao administrador da clínica para adicionar seu email ({user?.email}) na lista de funcionários</li>
                  <li>Se você acabou de ser cadastrado, pode levar alguns minutos para que seu acesso seja ativado</li>
                  <li>Caso você seja um médico e deseje criar sua própria clínica, pode se cadastrar como administrador</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="rounded-md border border-gray-200 p-4 bg-gray-50">
            <div className="flex items-start">
              <UserPlus className="h-5 w-5 text-cardio-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Solicitar acesso</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Se você acredita que deveria ter acesso a uma clínica, use os contatos abaixo:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-none">
                  <li><span className="font-medium">Email:</span> suporte@cardioflow.com.br</li>
                  <li><span className="font-medium">Telefone:</span> (11) 3456-7890</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
            Sair do sistema
          </Button>
          <Button 
            variant="default" 
            onClick={() => navigate('/admin/login')} 
            className="w-full sm:w-auto bg-cardio-500 hover:bg-cardio-600"
          >
            Cadastrar como administrador
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NoAccess;
