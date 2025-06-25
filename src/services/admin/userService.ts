
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { AdminUser, UserFilters } from './types';
import { getAllProfiles } from './adminDataService';

export const getAllUsers = async (filters?: UserFilters): Promise<AdminUser[]> => {
  try {
    console.log('=== BUSCANDO TODOS OS USUÁRIOS (NOVA VERSÃO SIMPLIFICADA) ===');
    console.log('Filtros aplicados:', filters);
    
    // Usar o novo serviço genérico
    const data = await getAllProfiles();
    
    if (!data || data.length === 0) {
      console.log('⚠️ NENHUM USUÁRIO ENCONTRADO');
      return [];
    }
    
    console.log('=== APLICANDO FILTROS ===');
    let filteredData = data;
    
    if (filters) {
      if (filters.role) {
        console.log('Aplicando filtro de role:', filters.role);
        filteredData = filteredData.filter(user => user.role === filters.role);
      }
      
      if (filters.createdAfter) {
        console.log('Aplicando filtro de data inicial:', filters.createdAfter);
        filteredData = filteredData.filter(user => 
          new Date(user.created_at) >= new Date(filters.createdAfter!)
        );
      }
      
      if (filters.createdBefore) {
        console.log('Aplicando filtro de data final:', filters.createdBefore);
        filteredData = filteredData.filter(user => 
          new Date(user.created_at) <= new Date(filters.createdBefore!)
        );
      }
      
      if (filters.name && filters.name.trim() !== '') {
        console.log('Aplicando filtro de nome:', filters.name);
        const searchTerm = filters.name.trim().toLowerCase();
        filteredData = filteredData.filter(user => 
          user.first_name?.toLowerCase().includes(searchTerm) ||
          user.last_name?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm)
        );
      }
    }
    
    console.log('=== MAPEANDO DADOS PARA INTERFACE ===');
    const users = filteredData.map((user: any) => ({
      id: user.id,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email || '',
      phone: user.phone || null,
      crm: user.crm || '',
      title: user.title || '',
      bio: user.bio || '',
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    })) as AdminUser[];
    
    console.log('✅ Total de usuários após filtros:', users.length);
    console.log('📋 Primeiros 3 usuários:', users.slice(0, 3));
    
    return users;
    
  } catch (error) {
    console.error('❌ ERRO COMPLETO ao buscar usuários:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    console.log('=== INICIANDO EXCLUSÃO COMPLETA DO USUÁRIO ===');
    console.log('Usuário ID:', userId);
    
    // 1. Deletar relações com clínicas (staff)
    console.log('1. Deletando relações clinic_staff...');
    const { error: staffError } = await supabase
      .from('clinic_staff')
      .delete()
      .eq('user_id', userId);
    
    if (staffError) {
      console.error('Erro ao deletar relações de staff:', staffError);
      throw staffError;
    }
    
    // 2. Atualizar registros criados pelo usuário para não quebrar foreign keys
    console.log('2. Atualizando referências em clínicas...');
    const { error: clinicsError } = await supabase
      .from('clinics')
      .update({ created_by: null })
      .eq('created_by', userId);
    
    if (clinicsError) {
      console.error('Erro ao atualizar clínicas criadas pelo usuário:', clinicsError);
      // Não fazer throw aqui, pois pode não ter criado clínicas
    }
    
    // 3. Atualizar outros registros que podem ter sido criados pelo usuário
    console.log('3. Atualizando outras referências...');
    const tables = ['patients', 'anamnesis', 'angioplasty_requests', 'insurance_companies'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .update({ created_by: null })
          .eq('created_by', userId);
        
        if (error) {
          console.warn(`Aviso ao atualizar ${table}:`, error);
        }
      } catch (e) {
        console.warn(`Aviso ao processar tabela ${table}:`, e);
      }
    }
    
    // 4. Deletar o perfil do usuário
    console.log('4. Deletando perfil do usuário...');
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error('Erro ao deletar perfil do usuário:', profileError);
      throw profileError;
    }
    
    console.log('✅ Usuário deletado completamente com sucesso');
  } catch (error) {
    console.error('❌ Erro ao excluir usuário:', error);
    throw error;
  }
};
