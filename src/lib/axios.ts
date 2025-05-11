
import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

// Cria uma instância do axios com configurações padrão
const api = axios.create({
  baseURL: 'https://kzfvvhdyohlgdkvbpvmx.supabase.co/rest/v1',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6ZnZ2aGR5b2hsZ2RrdmJwdm14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MTMzNTUsImV4cCI6MjA2MjQ4OTM1NX0.nq_YzBQF1U9qOLDCCPC-XYakToVfMVCkwxiqSJ9vZ88',
  }
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  
  if (data.session?.access_token) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  
  return config;
});

export default api;
