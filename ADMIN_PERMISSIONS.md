# Sistema de Permissões Admin/Clinic

## Estrutura de Roles

### 1. Admin Global (`admin`)
- **Permissões**: Acesso total ao sistema
- **Pode fazer**:
  - Criar novas clínicas
  - Criar admin_clinic para cada clínica
  - Ver todas as clínicas e usuários
  - Executar diagnósticos do sistema
  - Limpar dados órfãos

### 2. Admin de Clínica (`clinic_admin`)
- **Permissões**: Administrador de uma clínica específica
- **Pode fazer**:
  - Criar funcionários para sua clínica
  - Gerenciar staff da sua clínica
  - Ver dados apenas da sua clínica
  - Cadastrar pacientes na sua clínica

### 3. Outros Roles
- `doctor`: Médico
- `nurse`: Enfermeiro
- `receptionist`: Recepcionista
- `staff`: Equipe geral

## Fluxo de Criação de Usuários

### Admin Global cria Clinic Admin:
1. Admin global acessa `/admin/dashboard`
2. Vai na aba "Cadastrar" → "Nova Clínica"
3. Preenche dados da clínica E do admin da clínica
4. Sistema cria:
   - Nova clínica
   - Usuário admin_clinic
   - Associação na tabela `clinic_staff` com `is_admin=true`

### Clinic Admin cria Funcionários:
1. Admin da clínica acessa `/admin/dashboard` 
2. Vai na aba "Cadastrar" → "Novo Funcionário"
3. Preenche dados do funcionário
4. Sistema cria:
   - Novo usuário com role especificado
   - Associação na tabela `clinic_staff` com `is_admin=false`

## Edge Functions

### `register-clinic-admin`
- **Usado por**: Admin global
- **Função**: Criar clínica + admin da clínica
- **Autenticação**: Apenas `role='admin'`

### `create-clinic-staff`
- **Usado por**: Admin global OU admin da clínica
- **Função**: Criar funcionário para uma clínica específica
- **Autenticação**: 
  - `role='admin'` (pode criar em qualquer clínica)
  - `is_admin=true` na `clinic_staff` (pode criar apenas na sua clínica)

### `create-complete-user`
- **Usado por**: Admin global
- **Função**: Criar usuário avançado com controle total
- **Autenticação**: Apenas `role='admin'`

## Configurações Supabase Necessárias

### Auth Settings
```
disable_signup: false
external_anonymous_users_enabled: false  
auto_confirm_email: true
```

### Secrets (Edge Functions)
```
SUPABASE_URL: [URL do projeto]
SUPABASE_ANON_KEY: [Anon key]
SUPABASE_SERVICE_ROLE_KEY: [Service role key]
SERVICE_ROLE_KEY: [Service role key duplicado]
```

### Políticas RLS Importantes

#### profiles
- Global admin: acesso total
- Clinic admin: pode ver perfis para pesquisa
- Users: podem ver/editar próprio perfil

#### clinic_staff  
- Global admin: acesso total
- Clinic admin: pode ver/gerenciar staff da própria clínica
- Staff: pode ver próprio registro

#### clinics
- Global admin: acesso total  
- Clinic admin: pode ver/editar própria clínica
- Staff: pode ver clínica associada

## Senha Padrão

Todos os usuários são criados com senha padrão: `CardioFlow2024!`

O usuário deve alterar no primeiro login.

## Verificação de Permissões

### No Frontend
```typescript
// Verificar se é admin global
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

const isGlobalAdmin = profile?.role === 'admin';

// Verificar se é admin da clínica
const { data: staffRecord } = await supabase
  .from('clinic_staff')
  .select('is_admin')
  .eq('user_id', user.id)
  .eq('clinic_id', clinicId)
  .eq('active', true)
  .eq('is_admin', true)
  .single();

const isClinicAdmin = !!staffRecord;
```

### Nas Edge Functions
```typescript
// Verificar permissões
const canCreateStaff = 
  currentProfile?.role === 'admin' || // Admin global
  (staffRecord?.is_admin && staffRecord?.clinic_id === requestData.clinic_id); // Admin da clínica
```

## Troubleshooting

### Erro: "Sem permissão para criar funcionários"
- Verificar se o usuário é admin da clínica específica
- Verificar se `clinic_staff.is_admin=true` e `active=true`

### Erro: "Email já existe no sistema"
- Verificar tanto em `profiles` quanto em `auth.users`
- Usar diagnóstico do sistema para encontrar inconsistências

### Edge Functions não funcionam
- Verificar se todas as secrets estão configuradas
- Verificar logs das edge functions no dashboard Supabase
- Verificar se CORS está configurado corretamente

## Logs e Diagnóstico

Use o botão "Diagnóstico" no admin dashboard para:
- Verificar inconsistências entre `auth.users` e `profiles`
- Encontrar dados órfãos
- Verificar integridade do sistema

Use o botão "Limpar Órfãos" para:
- Sincronizar profiles faltantes
- Remover registros órfãos
- Corrigir inconsistências automáticas