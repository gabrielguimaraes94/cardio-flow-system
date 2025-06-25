export { isGlobalAdmin } from './permissionService';

export { 
  getAllProfiles, 
  getAllClinics, 
  getAllClinicStaff, 
  getAllPatients,
  createRecord,
  updateRecord,
  deleteRecord
} from './adminDataService';

export { 
  getAllUsers, 
  deleteUser 
} from './userService';

export { 
  registerClinic, 
  updateClinicStatus, 
  deleteClinic 
} from './clinicService';

export type { 
  AdminUser, 
  AdminClinic, 
  UserFilters, 
  ClinicFilters, 
  RegisterClinicRequest,
  CreateClinicParams
} from './types';