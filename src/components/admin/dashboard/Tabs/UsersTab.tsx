import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersList } from '../UsersList';
import { UserFilters } from '../UserFilters';
import { AdminUser } from '@/services/admin';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database["public"]["Enums"]["user_role"];

interface UsersTabProps {
  users: AdminUser[];
  loading: boolean;
  onRefetch: () => void;
  filters: {
    name: string;
    role: UserRole | '';
    createdAfter: string | undefined;
    createdBefore: string | undefined;
  };
  onFilterChange: (key: string, value: any) => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({
  users,
  loading,
  onRefetch,
  filters,
  onFilterChange
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = () => {
    setShowFilters(false);
    onRefetch();
  };
  
  const clearFilters = () => {
    onFilterChange('name', '');
    onFilterChange('role', '');
    onFilterChange('createdAfter', undefined);
    onFilterChange('createdBefore', undefined);
    setShowFilters(false);
    onRefetch();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Users</CardTitle>
        <CardDescription>
          View and manage all system users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UsersList
          users={users}
          loading={loading}
          filters={{
            name: filters.name,
            setName: (value) => onFilterChange('name', value)
          }}
          onOpenFilters={() => setShowFilters(true)}
          onRefetch={onRefetch}
        />
      </CardContent>
      {/* UserFilters component - make sure this component exists */}
      {typeof UserFilters !== 'undefined' && (
        <UserFilters
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFilterChange={onFilterChange}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
        />
      )}
    </Card>
  );
};