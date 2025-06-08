import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClinicsList } from '../ClinicsList';
import { ClinicFilters } from '../ClinicFilters';
import { AdminClinic } from '@/services/admin';

interface ClinicsTabProps {
  clinics: AdminClinic[];
  loading: boolean;
  onRefetch: () => void;
  filters: {
    name: string;
    city: string;
    active: boolean | undefined;
    createdAfter: string | undefined;
    createdBefore: string | undefined;
  };
  onFilterChange: (key: string, value: any) => void;
}

export const ClinicsTab: React.FC<ClinicsTabProps> = ({
  clinics,
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
    onFilterChange('city', '');
    onFilterChange('active', undefined);
    onFilterChange('createdAfter', undefined);
    onFilterChange('createdBefore', undefined);
    setShowFilters(false);
    onRefetch();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Clínicas</CardTitle>
        <CardDescription>
          Visualize e gerencie todas as clínicas cadastradas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ClinicsList
          clinics={clinics}
          loading={loading}
          filters={{
            name: filters.name,
            setName: (value) => onFilterChange('name', value)
          }}
          onOpenFilters={() => setShowFilters(true)}
          onRefetch={onRefetch}
        />
      </CardContent>

      <ClinicFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFilterChange={onFilterChange}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
      />
    </Card>
  );
};
