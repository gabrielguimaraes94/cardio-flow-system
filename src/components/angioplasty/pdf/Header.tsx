
import React from 'react';
import { Clinic } from '@/types/clinic';

interface HeaderProps {
  clinic: Clinic;
}

export const Header: React.FC<HeaderProps> = ({ clinic }) => {
  console.log('=== HEADER PDF DEBUG ===');
  console.log('Header - dados completos da clínica:', clinic);
  console.log('Header - logo_url existe?:', !!clinic.logo_url);
  console.log('Header - logo_url value:', clinic.logo_url);
  console.log('Header - clinic.name:', clinic.name);
  console.log('=== FIM HEADER DEBUG ===');

  return (
    <div className="flex justify-between items-start mb-8">
      <div className="max-w-[70%]">
        <h1 className="text-xl font-bold">{clinic.name}</h1>
        <p className="text-sm">{clinic.address}</p>
        <p className="text-sm">{clinic.city || 'São Paulo'}</p>
        <p className="text-sm">Tel: {clinic.phone}</p>
        {clinic.email && <p className="text-sm">Email: {clinic.email}</p>}
      </div>
      {clinic.logo_url ? (
        <div className="w-24 h-24 flex items-center justify-center border border-gray-200 rounded">
          <img 
            src={clinic.logo_url} 
            alt={`${clinic.name} Logo`} 
            className="max-w-full max-h-full object-contain"
            onLoad={() => {
              console.log('✅ Logo carregado com sucesso no Header PDF:', clinic.logo_url);
            }}
            onError={(e) => {
              console.error('❌ Erro ao carregar logo no Header PDF:', clinic.logo_url);
              console.error('Erro detalhado:', e);
              console.error('Event target:', e.target);
            }}
          />
        </div>
      ) : (
        <div className="w-24 h-24 flex items-center justify-center border border-gray-200 rounded bg-gray-50">
          <span className="text-xs text-gray-400">Sem logo</span>
        </div>
      )}
    </div>
  );
};
