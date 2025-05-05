
export interface InsuranceCompany {
  id: string;
  companyName: string; // Razão social
  tradingName: string; // Nome fantasia
  cnpj: string;
  ansRegistry: string; // Registro ANS
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    contactPerson?: string;
  };
  logoUrl?: string; // Logo da operadora
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FeeTableType = 'CBHPM' | 'AMB' | 'CUSTOM';

export interface InsuranceContract {
  id: string;
  insuranceCompanyId: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  feeTable: FeeTableType;
  multiplicationFactor: number;
  paymentDeadlineDays: number;
  documentUrls: string[]; // URLs para documentos do contrato
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProcedureMultiplicationFactor {
  procedureCode: string;
  procedureName: string;
  multiplicationFactor: number;
}

export interface InsuranceFormConfig {
  id: string;
  insuranceCompanyId: string;
  formTitle: string;
  requiredFields: string[];
  validationRules: {
    fieldName: string;
    rule: string;
    errorMessage: string;
  }[];
  allowedFileTypes: string[];
  maxFileSize: number; // in bytes
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceAuditRule {
  id: string;
  insuranceCompanyId: string;
  procedureCode: string;
  procedureName: string;
  materialLimits: {
    materialCode: string;
    materialName: string;
    maxQuantity: number;
  }[];
  preApprovedJustifications: string[];
  requiresSecondOpinion: boolean;
  requiresPriorAuthorization: boolean;
  authorizationDocuments: string[];
  createdAt: string;
  updatedAt: string;
}
