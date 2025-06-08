import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useClinic } from '@/contexts/ClinicContext';
import { fetchUsersForSelection } from '@/services/user/userProfileService';
import { UserProfile } from '@/types/profile';

export interface SurgicalTeamData {
  surgeon: UserProfile | null;
  cardiologist: UserProfile | null;
  anesthesiologist: UserProfile | null;
  nurses: UserProfile[];
}

interface SurgicalTeamSelectorProps {
  value: SurgicalTeamData;
  onChange: (team: SurgicalTeamData) => void;
}

export const SurgicalTeamSelector: React.FC<SurgicalTeamSelectorProps> = ({ value, onChange }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedClinic } = useClinic();
  const { toast } = useToast();

  const loadUsers = async () => {
    if (!selectedClinic?.id) return;
    
    setIsLoading(true);
    try {
      const usersData = await fetchUsersForSelection(selectedClinic.id);
      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [selectedClinic]);

  const handleUserSelect = (role: keyof SurgicalTeamData, userId: string) => {
    const selectedUser = users.find(user => user.id === userId) || null;
    
    onChange({
      ...value,
      [role]: selectedUser
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipe Cirúrgica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="surgeon">Cirurgião Principal</Label>
          <Select
            value={value.surgeon?.id || ""}
            onValueChange={(userId) => handleUserSelect('surgeon', userId)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cirurgião" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} - CRM: {user.crm}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cardiologist">Cardiologista</Label>
          <Select
            value={value.cardiologist?.id || ""}
            onValueChange={(userId) => handleUserSelect('cardiologist', userId)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cardiologista" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} - CRM: {user.crm}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="anesthesiologist">Anestesiologista</Label>
          <Select
            value={value.anesthesiologist?.id || ""}
            onValueChange={(userId) => handleUserSelect('anesthesiologist', userId)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o anestesiologista" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} - CRM: {user.crm}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
