-- Create the user_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'nurse', 'receptionist', 'clinic_admin', 'staff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;