
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProfile } from '@/types/profile';
import { SurgicalTeam } from '@/types/angioplasty-request';
import { fetchUsersForSelection } from '@/services/userService';
import { useClinic } from '@/contexts/ClinicContext';

interface SurgicalTeamSelectorProps {
  surgicalTeam: SurgicalTeam;
  onTeamChange: (team: SurgicalTeam) => void;
}

export const SurgicalTeamSelector: React.FC<SurgicalTeamSelectorProps> = ({
  surgicalTeam,
  onTeamChange,
}) => {
  const { selectedClinic } = useClinic();
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      if (!selectedClinic?.id) return;

      setIsLoading(true);
      try {
        console.log('=== CARREGANDO USUÁRIOS PARA EQUIPE CIRÚRGICA ===');
        console.log('Clínica selecionada:', selectedClinic.id);
        
        const users = await fetchUsersForSelection(selectedClinic.id);
        console.log('Usuários carregados para seleção:', users);
        setAvailableUsers(users);
      } catch (error) {
        console.error('Erro ao carregar usuários para seleção:', error);
        setAvailableUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [selectedClinic?.id]);

  const handleMemberChange = (role: keyof SurgicalTeam, userId: string) => {
    const selectedUser = availableUsers.find(user => user.id === userId) || null;
    onTeamChange({
      ...surgicalTeam,
      [role]: selectedUser,
    });
  };

  const formatUserOption = (user: UserProfile) => {
    const parts = [user.firstName, user.lastName];
    if (user.crm) parts.push(`(CRM: ${user.crm})`);
    return parts.join(' ');
  };

  if (!selectedClinic) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Selecione uma clínica para escolher a equipe cirúrgica.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipe Cirúrgica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Carregando profissionais...</p>
        ) : availableUsers.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Nenhum profissional disponível. Cadastre funcionários na clínica primeiro.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="surgeon">Cirurgião Principal</Label>
              <Select
                value={surgicalTeam.surgeon?.id || ''}
                onValueChange={(value) => handleMemberChange('surgeon', value)}
              >
                <SelectTrigger id="surgeon">
                  <SelectValue placeholder="Selecione o cirurgião principal" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {formatUserOption(user)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assistant">Assistente</Label>
              <Select
                value={surgicalTeam.assistant?.id || ''}
                onValueChange={(value) => handleMemberChange('assistant', value)}
              >
                <SelectTrigger id="assistant">
                  <SelectValue placeholder="Selecione o assistente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum assistente</SelectItem>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {formatUserOption(user)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anesthesiologist">Anestesista</Label>
              <Select
                value={surgicalTeam.anesthesiologist?.id || ''}
                onValueChange={(value) => handleMemberChange('anesthesiologist', value)}
              >
                <SelectTrigger id="anesthesiologist">
                  <SelectValue placeholder="Selecione o anestesista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum anestesista</SelectItem>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {formatUserOption(user)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
