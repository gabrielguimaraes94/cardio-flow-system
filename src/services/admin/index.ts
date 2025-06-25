
// Export de permissões e funções admin
export { isGlobalAdmin } from './permissionService';

// Export de serviços de dados
export { 
  getAllProfiles, 
  getAllClinics, 
  getAllClinicStaff, 
  getAllPatients 
} from './adminDataService';

// Export de serviços específicos
export { 
  getAllUsers, 
  deleteUser 
} from './userService';

export { 
  getAllClinicsAdmin as getAllClinics, 
  registerClinic, 
  updateClinicStatus, 
  deleteClinic 
} from './clinicService';

// Export de tipos
export type { 
  AdminUser, 
  AdminClinic, 
  UserFilters, 
  ClinicFilters, 
  RegisterClinicRequest,
  CreateClinicParams
} from './types';
