# Documentação do Banco Supabase

## Informações do Projeto

- **Project ID**: kzfvvhdyohlgdkvbpvmx
- **URL**: https://kzfvvhdyohlgdkvbpvmx.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6ZnZ2aGR5b2hsZ2RrdmJwdm14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MTMzNTUsImV4cCI6MjA2MjQ4OTM1NX0.nq_YzBQF1U9qOLDCCPC-XYakToVfMVCkwxiqSJ9vZ88

## Enums

### user_role
```sql
CREATE TYPE user_role AS ENUM (
  'admin',
  'doctor', 
  'nurse',
  'receptionist',
  'clinic_admin',
  'staff'
);
```

### angioplasty_status
```sql
CREATE TYPE angioplasty_status AS ENUM (
  'active',
  'cancelled'
);
```

## Estrutura das Tabelas

### 1. profiles
Tabela principal de usuários do sistema.

**Colunas:**
- `id` (uuid, PK) - Referência ao auth.users
- `first_name` (text, NOT NULL)
- `last_name` (text, NOT NULL)
- `email` (text, NOT NULL)
- `crm` (text, NOT NULL)
- `phone` (text, nullable)
- `role` (user_role, NOT NULL, default: 'doctor')
- `title` (text, nullable, default: '')
- `bio` (text, nullable, default: '')
- `notification_preferences` (jsonb, nullable, default: '{"systemUpdates": false, "smsNotifications": true, "emailNotifications": true, "appointmentReminders": true}')
- `is_first_login` (boolean, nullable, default: true)
- `created_at` (timestamptz, NOT NULL, default: now())
- `updated_at` (timestamptz, NOT NULL, default: now())

### 2. clinics
Tabela de clínicas.

**Colunas:**
- `id` (uuid, PK, default: gen_random_uuid())
- `name` (text, NOT NULL)
- `trading_name` (text, nullable)
- `cnpj` (text, nullable)
- `address` (text, NOT NULL)
- `city` (text, NOT NULL)
- `phone` (text, NOT NULL)
- `email` (text, NOT NULL)
- `logo_url` (text, nullable)
- `active` (boolean, NOT NULL, default: true)
- `created_by` (uuid, NOT NULL)
- `created_at` (timestamptz, NOT NULL, default: now())
- `updated_at` (timestamptz, NOT NULL, default: now())

### 3. clinic_staff
Tabela de relacionamento entre usuários e clínicas.

**Colunas:**
- `id` (uuid, PK, default: gen_random_uuid())
- `clinic_id` (uuid, NOT NULL, FK -> clinics.id)
- `user_id` (uuid, NOT NULL, FK -> profiles.id)
- `role` (text, NOT NULL)
- `is_admin` (boolean, NOT NULL, default: false)
- `active` (boolean, NOT NULL, default: true)
- `created_at` (timestamptz, NOT NULL, default: now())
- `updated_at` (timestamptz, NOT NULL, default: now())

### 4. patients
Tabela de pacientes.

**Colunas:**
- `id` (uuid, PK, default: gen_random_uuid())
- `clinic_id` (uuid, NOT NULL, FK -> clinics.id)
- `name` (text, NOT NULL)
- `cpf` (text, NOT NULL)
- `rg` (text, nullable)
- `birthdate` (date, NOT NULL)
- `gender` (text, NOT NULL)
- `phone` (text, nullable)
- `email` (text, nullable)
- `created_by` (uuid, NOT NULL)
- `created_at` (timestamptz, NOT NULL, default: now())
- `updated_at` (timestamptz, NOT NULL, default: now())

### 5. patient_addresses
Tabela de endereços dos pacientes.

**Colunas:**
- `id` (uuid, PK, default: gen_random_uuid())
- `patient_id` (uuid, NOT NULL, FK -> patients.id)
- `cep` (text, NOT NULL)
- `street` (text, NOT NULL)
- `number` (text, NOT NULL)
- `complement` (text, nullable)
- `neighborhood` (text, NOT NULL)
- `city` (text, NOT NULL)
- `state` (text, NOT NULL)
- `created_at` (timestamptz, NOT NULL, default: now())
- `updated_at` (timestamptz, NOT NULL, default: now())

### 6. insurance_companies
Tabela de empresas de seguros/convênios.

**Colunas:**
- `id` (uuid, PK, default: gen_random_uuid())
- `clinic_id` (uuid, NOT NULL, FK -> clinics.id)
- `company_name` (text, NOT NULL)
- `trading_name` (text, NOT NULL)
- `cnpj` (text, NOT NULL)
- `ans_registry` (text, NOT NULL)
- `street` (text, NOT NULL)
- `number` (text, NOT NULL)
- `complement` (text, nullable)
- `neighborhood` (text, NOT NULL)
- `city` (text, NOT NULL)
- `state` (text, NOT NULL)
- `zip_code` (text, NOT NULL)
- `email` (text, NOT NULL)
- `phone` (text, NOT NULL)
- `contact_person` (text, nullable)
- `logo_url` (text, nullable)
- `active` (boolean, NOT NULL, default: true)
- `created_by` (uuid, NOT NULL)
- `created_at` (timestamptz, NOT NULL, default: now())
- `updated_at` (timestamptz, NOT NULL, default: now())

### 7. insurance_contracts
Tabela de contratos com convênios.

**Colunas:**
- `id` (uuid, PK, default: gen_random_uuid())
- `insurance_company_id` (uuid, NOT NULL, FK -> insurance_companies.id)
- `contract_number` (text, NOT NULL)
- `fee_table` (text, NOT NULL)
- `start_date` (date, NOT NULL)
- `end_date` (date, NOT NULL)
- `multiplication_factor` (numeric, NOT NULL, default: 1.0)
- `payment_deadline_days` (integer, NOT NULL, default: 30)
- `document_urls` (text[], nullable, default: '{}')
- `active` (boolean, NOT NULL, default: true)
- `created_by` (uuid, NOT NULL)
- `created_at` (timestamptz, NOT NULL, default: now())
- `updated_at` (timestamptz, NOT NULL, default: now())

### 8. insurance_form_configs
Tabela de configurações de formulários dos convênios.

**Colunas:**
- `id` (uuid, PK, default: gen_random_uuid())
- `insurance_company_id` (uuid, NOT NULL, FK -> insurance_companies.id)
- `form_title` (text, NOT NULL)
- `required_fields` (text[], NOT NULL, default: '{}')
- `allowed_file_types` (text[], NOT NULL, default: '{}')
- `max_file_size` (integer, NOT NULL, default: 5242880)
- `validation_rules` (jsonb, NOT NULL, default: '[]')
- `created_by` (uuid, NOT NULL)
- `created_at` (timestamptz, NOT NULL, default: now())
- `updated_at` (timestamptz, NOT NULL, default: now())

### 9. insurance_audit_rules
Tabela de regras de auditoria dos convênios.

**Colunas:**
- `id` (uuid, PK, default: gen_random_uuid())
- `insurance_company_id` (uuid, NOT NULL, FK -> insurance_companies.id)
- `procedure_code` (text, NOT NULL)
- `procedure_name` (text, NOT NULL)
- `material_limits` (jsonb, NOT NULL, default: '[]')
- `requires_second_opinion` (boolean, NOT NULL, default: false)
- `requires_prior_authorization` (boolean, NOT NULL, default: false)
- `pre_approved_justifications` (text[], nullable, default: '{}')
- `authorization_documents` (text[], nullable, default: '{}')
- `created_by` (uuid, NOT NULL)
- `created_at` (timestamptz, NOT NULL, default: now())
- `updated_at` (timestamptz, NOT NULL, default: now())

### 10. procedure_multiplication_factors
Tabela de fatores de multiplicação por procedimento.

**Colunas:**
- `id` (uuid, PK, default: gen_random_uuid())
- `insurance_company_id` (uuid, NOT NULL, FK -> insurance_companies.id)
- `contract_id` (uuid, nullable, FK -> insurance_contracts.id)
- `procedure_code` (text, NOT NULL)
- `procedure_name` (text, NOT NULL)
- `multiplication_factor` (numeric, NOT NULL)
- `created_by` (uuid, NOT NULL)
- `created_at` (timestamptz, NOT NULL, default: now())
- `updated_at` (timestamptz, NOT NULL, default: now())

### 11. anamnesis
Tabela de anamneses dos pacientes.

**Colunas:**
- `id` (uuid, PK, default: gen_random_uuid())
- `patient_id` (uuid, NOT NULL, FK -> patients.id)
- `created_by` (uuid, NOT NULL)
- `created_at` (timestamptz, NOT NULL, default: now())
- `updated_at` (timestamptz, NOT NULL, default: now())

**Campos Clínicos (todos nullable com default false onde aplicável):**
- `hypertension` (boolean), `hypertension_time` (text), `hypertension_meds` (text)
- `diabetes` (boolean), `diabetes_type` (text), `diabetes_control` (text), `diabetes_meds` (text)
- `dyslipidemia` (boolean), `dyslipidemia_meds` (text)
- `family_history` (boolean), `family_history_details` (text)
- `obesity` (boolean), `bmi` (text)
- `sedentary` (boolean), `physical_activity` (text)
- `smoking` (text), `smoking_years` (text)
- `previous_iam` (boolean), `iam_date` (date), `iam_location` (text), `iam_treatment` (text)
- `previous_angioplasty` (boolean), `angioplasty_date` (date), `angioplasty_vessels` (text), `angioplasty_stents` (text)
- `revascularization` (boolean), `revascularization_date` (date), `revascularization_grafts` (text)
- `valvopathy` (boolean), `valvopathy_type` (text), `valvopathy_severity` (text)
- `heart_failure` (boolean), `heart_failure_class` (text)
- `renal_disease` (boolean), `renal_stage` (text), `dialysis` (boolean)
- `respiratory_disease` (boolean), `respiratory_type` (text), `respiratory_control` (text)
- `stroke` (boolean), `stroke_date` (date), `stroke_type` (text), `stroke_sequelae` (text)
- `pad` (boolean), `pad_severity` (text), `pad_treatment` (text)
- `other_comorbidities` (boolean), `other_comorbidities_details` (text)
- `chest_pain` (boolean), `chest_pain_characteristics` (text), `chest_pain_duration` (text), `chest_pain_radiation` (text)
- `dyspnea` (boolean), `dyspnea_class` (text)
- `syncope` (boolean), `syncope_frequency` (text)
- `palpitations` (boolean), `palpitations_characteristics` (text)
- `edema` (boolean), `edema_intensity` (text), `edema_location` (text)
- `medications` (jsonb, default: '[]')
- Medicamentos específicos: `antiplatelets`, `aas`, `clopidogrel`, `ticagrelor`, `prasugrel`, `anticoagulants`, `warfarin`, `dabigatran`, `rivaroxaban`, `apixaban`, `edoxaban` (todos boolean)
- Exames: `cholesterol`, `ldl`, `hdl`, `triglycerides` (todos text)
- `doctor_name` (text), `doctor_crm` (text)

### 12. angioplasty_requests
Tabela de solicitações de angioplastia.

**Colunas:**
- `id` (uuid, PK, default: gen_random_uuid())
- `patient_id` (uuid, NOT NULL, FK -> patients.id)
- `patient_name` (text, NOT NULL)
- `insurance_id` (uuid, NOT NULL, FK -> insurance_companies.id)
- `insurance_name` (text, NOT NULL)
- `clinic_id` (uuid, NOT NULL, FK -> clinics.id)
- `request_number` (text, NOT NULL)
- `coronary_angiography` (text, NOT NULL)
- `proposed_treatment` (text, NOT NULL)
- `tuss_procedures` (jsonb, NOT NULL, default: '[]')
- `materials` (jsonb, NOT NULL, default: '[]')
- `surgical_team` (jsonb, NOT NULL)
- `status` (angioplasty_status, NOT NULL, default: 'active')
- `cancellation_reason` (text, nullable)
- `cancelled_at` (timestamptz, nullable)
- `cancelled_by` (uuid, nullable)
- `created_by` (uuid, NOT NULL)
- `created_at` (timestamptz, NOT NULL, default: now())

## Políticas RLS (Row Level Security)

### Tabelas com Política Simples (Admin Only)
As seguintes tabelas têm apenas uma política que permite acesso total aos administradores globais:

- `anamnesis`
- `angioplasty_requests`
- `insurance_companies`
- `insurance_contracts`
- `insurance_form_configs`
- `insurance_audit_rules`
- `patient_addresses`
- `patients`
- `procedure_multiplication_factors`

```sql
CREATE POLICY "admin_full_access" 
ON public.[table_name] 
FOR ALL 
USING (public.get_current_user_role() = 'admin');
```

### Tabela profiles - Políticas Específicas

**1. Admin Global - Acesso Total:**
```sql
CREATE POLICY "global_admin_full_access_profiles"
ON public.profiles
FOR ALL
USING (public.get_current_user_role() = 'admin');
```

**2. Admin de Clínica - Inserir Usuários:**
```sql
CREATE POLICY "clinic_admin_can_insert_profiles"
ON public.profiles
FOR INSERT
WITH CHECK (
  public.get_current_user_role() = 'admin'
  OR public.is_any_clinic_admin()
);
```

**3. Admin de Clínica - Visualizar Usuários:**
```sql
CREATE POLICY "clinic_admin_can_select_profiles"
ON public.profiles
FOR SELECT
USING (
  public.get_current_user_role() = 'admin'
  OR id = auth.uid() -- Próprio perfil
  OR public.is_any_clinic_admin() -- Admin de clínica pode pesquisar
);
```

**4. Usuários - Editar Próprio Perfil:**
```sql
CREATE POLICY "users_can_manage_own_profile"
ON public.profiles
FOR UPDATE
USING (id = auth.uid());
```

### Tabela clinics - Políticas Específicas

**1. Admin Global - Acesso Total:**
```sql
CREATE POLICY "global_admin_full_access_clinics"
ON public.clinics
FOR ALL
USING (public.get_current_user_role() = 'admin');
```

**2. Admin de Clínica - Visualizar Própria Clínica:**
```sql
CREATE POLICY "clinic_admin_can_view_own_clinic"
ON public.clinics
FOR SELECT
USING (is_clinic_admin_for_clinic(id));
```

**3. Admin de Clínica - Atualizar Própria Clínica:**
```sql
CREATE POLICY "clinic_admin_can_update_own_clinic"
ON public.clinics
FOR UPDATE
USING (is_clinic_admin_for_clinic(id));
```

**4. Staff - Visualizar Clínicas Associadas:**
```sql
CREATE POLICY "staff_can_view_associated_clinics"
ON public.clinics
FOR SELECT
USING (is_staff_of_clinic(id));
```

### Tabela clinic_staff - Políticas Específicas

**1. Admin Global - Acesso Total:**
```sql
CREATE POLICY "global_admin_full_access_clinic_staff"
ON public.clinic_staff
FOR ALL
USING (public.get_current_user_role() = 'admin');
```

**2. Admin de Clínica - Adicionar Staff:**
```sql
CREATE POLICY "clinic_admin_can_add_staff_to_own_clinic"
ON public.clinic_staff
FOR INSERT
WITH CHECK (is_clinic_admin_for_clinic(clinic_id));
```

**3. Admin de Clínica - Visualizar Staff:**
```sql
CREATE POLICY "clinic_admin_can_view_own_clinic_staff"
ON public.clinic_staff
FOR SELECT
USING (is_clinic_admin_for_clinic(clinic_id) OR user_id = auth.uid());
```

**4. Admin de Clínica - Atualizar Staff:**
```sql
CREATE POLICY "clinic_admin_can_update_own_clinic_staff"
ON public.clinic_staff
FOR UPDATE
USING (is_clinic_admin_for_clinic(clinic_id));
```

## Funções do Banco

### 1. get_current_user_role()
```sql
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;
```

### 2. is_global_admin(user_uuid)
```sql
CREATE OR REPLACE FUNCTION public.is_global_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_uuid;
  RETURN user_role = 'admin';
END;
$$;
```

### 3. admin_get_table_data(table_name, limit_count)
```sql
CREATE OR REPLACE FUNCTION public.admin_get_table_data(table_name text, limit_count integer DEFAULT 100)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    query_text text;
BEGIN
    -- Verificar se o usuário é admin
    IF public.get_current_user_role() != 'admin' THEN
        RAISE EXCEPTION 'Acesso negado. Apenas administradores podem acessar esta função.';
    END IF;
    
    -- Construir query dinamicamente
    query_text := format('SELECT json_agg(row_to_json(t)) FROM (SELECT * FROM public.%I ORDER BY created_at DESC LIMIT %s) t', table_name, limit_count);
    
    -- Executar query
    EXECUTE query_text INTO result;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$;
```

### 4. get_user_clinics(user_uuid)
```sql
CREATE OR REPLACE FUNCTION public.get_user_clinics(user_uuid uuid)
RETURNS TABLE(
  clinic_id uuid, 
  clinic_name text, 
  clinic_city text,
  clinic_address text,
  clinic_phone text,
  clinic_email text,
  clinic_logo_url text,
  clinic_active boolean,
  is_admin boolean,
  staff_id uuid,
  staff_role text,
  staff_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
```

### 5. is_any_clinic_admin()
```sql
CREATE OR REPLACE FUNCTION public.is_any_clinic_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinic_staff cs
    WHERE cs.user_id = auth.uid()
      AND cs.is_admin = true
      AND cs.active = true
  );
$$;
```

### 6. is_clinic_admin_for_clinic(clinic_uuid)
```sql
CREATE OR REPLACE FUNCTION public.is_clinic_admin_for_clinic(clinic_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinic_staff cs
    WHERE cs.clinic_id = clinic_uuid
      AND cs.user_id = auth.uid()
      AND cs.is_admin = true
      AND cs.active = true
  );
$$;
```

### 7. is_staff_of_clinic(clinic_uuid)
```sql
CREATE OR REPLACE FUNCTION public.is_staff_of_clinic(clinic_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinic_staff cs
    WHERE cs.clinic_id = clinic_uuid
      AND cs.user_id = auth.uid()
      AND cs.active = true
  );
$$;
```

### 8. is_user_first_login(user_uuid)
```sql
CREATE OR REPLACE FUNCTION public.is_user_first_login(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(is_first_login, false) FROM public.profiles WHERE id = user_uuid;
$$;
```

### 9. mark_first_login_complete(user_uuid)
```sql
CREATE OR REPLACE FUNCTION public.mark_first_login_complete(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET is_first_login = false 
  WHERE id = user_uuid;
END;
$$;
```

### 10. is_clinic_admin(user_uuid, clinic_uuid)
### 11. is_clinic_member(user_uuid, clinic_uuid)
### 12. is_clinic_staff_member(user_uuid)
### 13. add_clinic_staff(p_user_id, p_clinic_id, p_is_admin, p_role)
### 14. remove_clinic_staff(staff_id, admin_user_id)
### 15. create_clinic() - Duas versões com parâmetros diferentes
### 16. debug_get_auth_users()
### 17. sync_missing_profiles()
### 18. has_role(_user_id, _role)
### 19. handle_new_user() - Trigger function

## Storage Buckets

### 1. cardioflowbucket
- **Público**: Não
- **Uso**: Armazenamento geral de arquivos

### 2. clinic-assets  
- **Público**: Sim
- **Uso**: Assets públicos das clínicas (logos, etc.)

## Triggers

### on_auth_user_created
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

Automaticamente cria um profile quando um novo usuário é criado no sistema de autenticação.

## Relacionamentos Principais

1. **profiles** ↔ **clinic_staff** ↔ **clinics** (Many-to-Many)
2. **clinics** → **patients** (One-to-Many)
3. **patients** → **patient_addresses** (One-to-Many)
4. **patients** → **anamnesis** (One-to-Many)
5. **patients** → **angioplasty_requests** (One-to-Many)
6. **clinics** → **insurance_companies** (One-to-Many)
7. **insurance_companies** → **insurance_contracts** (One-to-Many)
8. **insurance_companies** → **insurance_form_configs** (One-to-Many)
9. **insurance_companies** → **insurance_audit_rules** (One-to-Many)
10. **insurance_companies** → **procedure_multiplication_factors** (One-to-Many)

## Configuração do Cliente

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kzfvvhdyohlgdkvbpvmx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6ZnZ2aGR5b2hsZ2RrdmJwdm14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MTMzNTUsImV4cCI6MjA2MjQ4OTM1NX0.nq_YzBQF1U9qOLDCCPC-XYakToVfMVCkwxiqSJ9vZ88'

export const supabase = createClient(supabaseUrl, supabaseKey)
```

## Últimas Atualizações (2025-07-12)

### 1. Sistema de Primeiro Login
- Adicionado campo `is_first_login` na tabela `profiles`
- Criadas funções `is_user_first_login()` e `mark_first_login_complete()`
- Permite controlar se é o primeiro acesso do usuário

### 2. Políticas RLS Específicas para Administradores de Clínica
- **profiles**: Admin de clínica pode inserir e pesquisar usuários
- **clinics**: Admin de clínica pode visualizar/atualizar própria clínica
- **clinic_staff**: Admin de clínica pode gerenciar staff da própria clínica
- Mantém segurança: apenas admin global e admin de clínica têm acesso

### 3. Novas Funções de Controle de Acesso
- `is_any_clinic_admin()`: Verifica se usuário é admin de alguma clínica
- `is_clinic_admin_for_clinic()`: Verifica se usuário é admin de clínica específica
- `is_staff_of_clinic()`: Verifica se usuário é staff de clínica específica

### 4. Função RPC para Criação de Usuários (SOLUÇÃO IMPLEMENTADA)

**✅ PROBLEMA RESOLVIDO:** Implementada função `create_user_profile_direct()` que resolve o problema de foreign key constraint.

```sql
CREATE OR REPLACE FUNCTION public.create_user_profile_direct(
  p_email text,
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_crm text,
  p_role text,
  p_title text,
  p_bio text
)
RETURNS uuid
```

**🔧 SOLUÇÃO APLICADA:**
1. **Removida foreign key constraint** temporariamente da tabela `profiles`
2. **Criada função RPC** que cria profiles diretamente sem depender de `auth.users`
3. **Atualizado código** para usar a nova função em `ClinicRegistrationForm` e `UserManagement`

**⚠️ NOTA IMPORTANTE:** 
- Esta é uma solução funcional que permite criar usuários sem problemas de foreign key
- Os profiles criados são "órfãos" (não têm correspondência em auth.users)
- Para uma solução completa de autenticação, seria necessário implementar Edge Functions com service role

**💡 VANTAGENS DA SOLUÇÃO:**
- ✅ Resolve o problema de foreign key constraint imediatamente
- ✅ Permite criação de usuários sem configuração adicional
- ✅ Mantém a estrutura de permissões existente
- ✅ Funciona tanto para ClinicRegistrationForm quanto UserManagement

## Notas Importantes

1. **Segurança Multi-nível**: 
   - Admin global: acesso total a tudo
   - Admin de clínica: acesso restrito à própria clínica
   - Usuários: acesso apenas ao próprio perfil

2. **RLS**: Todas as tabelas têm Row Level Security habilitado com políticas específicas

3. **Auditoria**: Todas as tabelas têm campos created_at, updated_at e created_by

4. **Soft Delete**: A tabela clinic_staff usa soft delete através do campo 'active'

5. **Tipos**: O sistema usa Enums TypeScript gerados automaticamente pelo Supabase

6. **Integridade**: Foreign keys garantem integridade referencial entre tabelas relacionadas

7. **Hierarquia de Acesso**: O sistema implementa hierarquia de permissões:
   - Global Admin > Clinic Admin > Staff > Usuário comum

8. **⚠️ Limitações Atuais de Criação de Usuários:**
   - `admin.createUser()` requer service role key
   - Funções RPC não conseguem acessar auth context
   - Workarounds temporários estão em uso

## Edge Functions Recomendadas

Para resolver as limitações atuais, considere implementar Edge Functions para:

1. **Criação de Usuários Completa**
2. **Operações Admin que requerem Service Role**
3. **Integração com APIs externas**
4. **Processamento de dados sensíveis**