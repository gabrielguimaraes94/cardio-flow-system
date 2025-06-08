
// Export types
export type {
  AdminData,
  ClinicData,
  CreateClinicResponse,
  CreateClinicParams,
  AddClinicStaffParams,
  AdminClinic,
  AdminUser,
  ClinicFilters,
  UserFilters
} from './types';

// Export permission services
export {
  isGlobalAdmin,
  isClinicAdmin
} from './permissionService';

// Export clinic services
export {
  getAllClinics,
  registerClinic,
  updateClinicStatus,
  deleteClinic
} from './clinicService';

// Export user services
export {
  getAllUsers,
  deleteUser
} from './userService';
