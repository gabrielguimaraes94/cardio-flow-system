
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/profile';

// Função específica para buscar um perfil pelo ID
export const fetchProfileById = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('=== BUSCANDO PROFILE POR ID ===');
    console.log('User ID:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Erro ao buscar profile por ID:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem do erro:', error.message);
      console.error('Detalhes do erro:', error.details);
      return null;
    }
    
    if (!data) {
      console.log('Nenhum profile encontrado para ID:', userId);
      return null;
    }
    
    console.log('Profile encontrado:', data);
    
    return {
      id: data.id,
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      email: data.email || '',
      phone: data.phone || null,
      crm: data.crm || '',
      title: data.title || '',
      bio: data.bio || '',
      role: data.role || 'staff'
    };
    
  } catch (error) {
    console.error('Erro na função fetchProfileById:', error);
    return null;
  }
};

// Função para buscar múltiplos perfis pelos IDs
export const fetchProfilesByIds = async (userIds: string[]): Promise<UserProfile[]> => {
  try {
    console.log('=== BUSCANDO MÚLTIPLOS PROFILES ===');
    console.log('User IDs:', userIds);
    
    const profiles: UserProfile[] = [];
    
    // Buscar cada perfil individualmente
    for (const userId of userIds) {
      const profile = await fetchProfileById(userId);
      if (profile) {
        profiles.push(profile);
      }
    }
    
    console.log('Profiles encontrados:', profiles.length);
    return profiles;
    
  } catch (error) {
    console.error('Erro na função fetchProfilesByIds:', error);
    return [];
  }
};

// Função alternativa para buscar todos os profiles de uma vez (para debug)
export const fetchAllProfilesByIds = async (userIds: string[]): Promise<UserProfile[]> => {
  try {
    console.log('=== FUNÇÃO ALTERNATIVA: BUSCAR TODOS OS PROFILES ===');
    console.log('User IDs para buscar:', userIds);
    
    // Primeiro, vamos tentar buscar todos de uma vez
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
    
    console.log('Resultado da busca em lote:');
    console.log('Data:', data);
    console.log('Error:', error);
    
    if (error) {
      console.error('Erro ao buscar profiles em lote:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem do erro:', error.message);
      
      // Se falhou, tenta buscar individualmente
      console.log('Tentando buscar individualmente...');
      return await fetchProfilesByIds(userIds);
    }
    
    if (!data || data.length === 0) {
      console.log('Nenhum profile encontrado na busca em lote');
      return [];
    }
    
    console.log(`Encontrados ${data.length} profiles de ${userIds.length} solicitados`);
    
    // Mapear os dados para o formato UserProfile
    const profiles: UserProfile[] = data.map(profile => ({
      id: profile.id,
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      email: profile.email || '',
      phone: profile.phone || null,
      crm: profile.crm || '',
      title: profile.title || '',
      bio: profile.bio || '',
      role: profile.role || 'staff'
    }));
    
    console.log('Profiles mapeados:', profiles);
    return profiles;
    
  } catch (error) {
    console.error('Erro na função fetchAllProfilesByIds:', error);
    return [];
  }
};

// Função para debug - verificar usuário atual e permissões
export const debugCurrentUser = async (): Promise<void> => {
  try {
    console.log('=== DEBUG USUÁRIO ATUAL ===');
    
    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Erro ao verificar usuário autenticado:', authError);
      return;
    }
    
    if (!user) {
      console.log('Nenhum usuário autenticado');
      return;
    }
    
    console.log('Usuário autenticado:', {
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    // Tentar buscar o profile do usuário atual
    const currentUserProfile = await fetchProfileById(user.id);
    console.log('Profile do usuário atual:', currentUserProfile);
    
    // Verificar políticas RLS fazendo uma query simples
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role')
      .limit(5);
    
    console.log('Teste de acesso aos profiles (primeiros 5):');
    console.log('Data:', testData);
    console.log('Error:', testError);
    
  } catch (error) {
    console.error('Erro no debug do usuário atual:', error);
  }
};
