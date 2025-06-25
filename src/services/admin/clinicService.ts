
import { supabase } from '@/integrations/supabase/client';
import { AdminClinic, CreateClinicParams, ClinicFilters } from './types';
import { getAllClinics } from './adminDataService';

export const getAllClinics = async (filters?: ClinicFilters): Promise<AdminClinic[]> => {
  try {
    console.log('=== BUSCANDO TODAS AS CLÍNICAS (NOVA VERSÃO SIMPLIFICADA) ===');
    console.log('Filtros aplicados:', filters);
    
    // Usar o novo serviço genérico
    const data = await getAllClinics();
    
    if (!data || data.length === 0) {
      console.log('⚠️ NENHUMA CLÍNICA ENCONTRADA');
      return [];
    }
    
    console.log('=== APLICANDO FILTROS ===');
    let filteredData = data;
    
    if (filters) {
      if (filters.active !== undefined) {
        console.log('Aplicando filtro de status ativo:', filters.active);
        filteredData = filteredData.filter(clinic => clinic.active === filters.active);
      }
      
      if (filters.createdAfter) {
        console.log('Aplicando filtro de data inicial:', filters.createdAfter);
        filteredData = filteredData.filter(clinic => 
          new Date(clinic.created_at) >= new Date(filters.createdAfter!)
        );
      }
      
      if (filters.createdBefore) {
        console.log('Aplicando filtro de data final:', filters.createdBefore);
        filteredData = filteredData.filter(clinic => 
          new Date(clinic.created_at) <= new Date(filters.createdBefore!)
        );
      }
      
      if (filters.name && filters.name.trim() !== '') {
        console.log('Aplicando filtro de nome:', filters.name);
        const searchTerm = filters.name.trim().toLowerCase();
        filteredData = filteredData.filter(clinic => 
          clinic.name?.toLowerCase().includes(searchTerm) ||
          clinic.city?.toLowerCase().includes(searchTerm) ||
          clinic.email?.toLowerCase().includes(searchTerm)
        );
      }
    }
    
    console.log('=== MAPEANDO DADOS PARA INTERFACE ===');
    const clinics = filteredData.map((clinic: any) => ({
      id: clinic.id,
      name: clinic.name,
      city: clinic.city,
      address: clinic.address,
      phone: clinic.phone,
      email: clinic.email,
      tradingName: clinic.trading_name,
      cnpj: clinic.cnpj,
      logoUrl: clinic.logo_url,
      active: clinic.active,
      created_at: clinic.created_at,
      updated_at: clinic.updated_at,
      created_by: clinic.created_by
    })) as AdminClinic[];
    
    console.log('✅ Total de clínicas após filtros:', clinics.length);
    console.log('📋 Primeiros 3 clínicas:', clinics.slice(0, 3));
    
    return clinics;
    
  } catch (error) {
    console.error('❌ ERRO COMPLETO ao buscar clínicas:', error);
    throw error;
  }
};

export const registerClinic = async (params: CreateClinicParams): Promise<string> => {
  try {
    console.log('=== REGISTRANDO NOVA CLÍNICA ===');
    console.log('Parâmetros:', params);
    
    const { data, error } = await supabase.rpc('create_clinic', {
      p_name: params.name,
      p_city: params.city,
      p_address: params.address,
      p_phone: params.phone,
      p_email: params.email,
      p_created_by: params.createdBy,
      p_trading_name: params.tradingName || null,
      p_cnpj: params.cnpj || null
    });
    
    if (error) {
      console.error('Erro ao registrar clínica:', error);
      throw error;
    }
    
    const clinicId = data.id;
    console.log('✅ Clínica registrada com ID:', clinicId);
    
    return clinicId;
  } catch (error) {
    console.error('❌ Erro ao registrar clínica:', error);
    throw error;
  }
};

export const updateClinicStatus = async (clinicId: string, active: boolean): Promise<void> => {
  try {
    console.log('=== ATUALIZANDO STATUS DA CLÍNICA ===');
    console.log('Clínica ID:', clinicId);
    console.log('Novo status:', active);
    
    const { error } = await supabase
      .from('clinics')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', clinicId);
    
    if (error) {
      console.error('Erro ao atualizar status da clínica:', error);
      throw error;
    }
    
    console.log('✅ Status da clínica atualizado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao atualizar status da clínica:', error);
    throw error;
  }
};

export const deleteClinic = async (clinicId: string): Promise<void> => {
  try {
    console.log('=== INICIANDO EXCLUSÃO COMPLETA DA CLÍNICA ===');
    console.log('Clínica ID:', clinicId);
    
    // 1. Deletar funcionários da clínica
    console.log('1. Deletando funcionários da clínica...');
    const { error: staffError } = await supabase
      .from('clinic_staff')
      .delete()
      .eq('clinic_id', clinicId);
    
    if (staffError) {
      console.error('Erro ao deletar funcionários da clínica:', staffError);
      throw staffError;
    }
    
    // 2. Atualizar ou deletar registros relacionados
    console.log('2. Atualizando registros relacionados...');
    const relatedTables = ['patients', 'angioplasty_requests', 'insurance_companies'];
    
    for (const table of relatedTables) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('clinic_id', clinicId);
        
        if (error) {
          console.warn(`Aviso ao deletar registros de ${table}:`, error);
        }
      } catch (e) {
        console.warn(`Aviso ao processar tabela ${table}:`, e);
      }
    }
    
    // 3. Deletar a clínica
    console.log('3. Deletando a clínica...');
    const { error: clinicError } = await supabase
      .from('clinics')
      .delete()
      .eq('id', clinicId);
    
    if (clinicError) {
      console.error('Erro ao deletar clínica:', clinicError);
      throw clinicError;
    }
    
    console.log('✅ Clínica deletada completamente com sucesso');
  } catch (error) {
    console.error('❌ Erro ao excluir clínica:', error);
    throw error;
  }
};
