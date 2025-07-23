-- Verificar se o enum user_role existe e criar se necessário
DO $$ 
BEGIN
    -- Tentar criar o enum user_role se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
            'admin',
            'clinic_admin', 
            'doctor',
            'nurse',
            'receptionist',
            'staff'
        );
        RAISE NOTICE 'Enum user_role criado com sucesso';
    ELSE
        RAISE NOTICE 'Enum user_role já existe';
    END IF;
END $$;