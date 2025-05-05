
import { 
  InsuranceCompany, 
  InsuranceContract, 
  InsuranceFormConfig, 
  InsuranceAuditRule 
} from "@/types/insurance";
import { v4 as uuid } from "uuid";

// Mock data for insurance companies
let insuranceCompanies: InsuranceCompany[] = [
  {
    id: "1",
    companyName: "Amil Assistência Médica Internacional S.A.",
    tradingName: "Amil",
    cnpj: "29.309.127/0001-79",
    ansRegistry: "326305",
    address: {
      street: "Rua Arquiteto Olavo Redig de Campos",
      number: "105",
      complement: "Torre B, 14º andar",
      neighborhood: "Brooklin Paulista",
      city: "São Paulo",
      state: "SP",
      zipCode: "04711-904"
    },
    contactInfo: {
      email: "relacionamento@amil.com.br",
      phone: "(11) 3279-3000",
      contactPerson: "Maria Silva"
    },
    logoUrl: "https://logo.clearbit.com/amil.com.br",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    companyName: "Bradesco Saúde S.A.",
    tradingName: "Bradesco Saúde",
    cnpj: "92.693.118/0001-60",
    ansRegistry: "005711",
    address: {
      street: "Rua Barão de Itapagipe",
      number: "225",
      neighborhood: "Rio Comprido",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "20261-901"
    },
    contactInfo: {
      email: "contato@bradescosaude.com.br",
      phone: "0800 701 2700",
      contactPerson: "João Pereira"
    },
    logoUrl: "https://logo.clearbit.com/bradescosaude.com.br",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock data for insurance contracts
let insuranceContracts: InsuranceContract[] = [
  {
    id: "1",
    insuranceCompanyId: "1",
    contractNumber: "AMI-2023-001",
    startDate: "2023-01-01",
    endDate: "2024-12-31",
    feeTable: "CBHPM",
    multiplicationFactor: 1.2,
    paymentDeadlineDays: 30,
    documentUrls: [
      "/contracts/amil-2023-001.pdf",
      "/contracts/amil-2023-001-annex1.pdf"
    ],
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    insuranceCompanyId: "2",
    contractNumber: "BRA-2023-005",
    startDate: "2023-03-15",
    endDate: "2025-03-14",
    feeTable: "AMB",
    multiplicationFactor: 1.5,
    paymentDeadlineDays: 45,
    documentUrls: [
      "/contracts/bradesco-2023-005.pdf"
    ],
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock data for form configurations
let formConfigs: InsuranceFormConfig[] = [
  {
    id: "1",
    insuranceCompanyId: "1",
    formTitle: "Amil - Solicitação de Procedimentos Cardiológicos",
    requiredFields: [
      "patientName",
      "patientPlan",
      "patientCardNumber",
      "procedureCode",
      "procedureName",
      "justification"
    ],
    validationRules: [
      {
        fieldName: "patientCardNumber",
        rule: "^[0-9]{16}$",
        errorMessage: "Número do cartão deve conter 16 dígitos numéricos"
      },
      {
        fieldName: "procedureCode",
        rule: "^[0-9]{8}$",
        errorMessage: "Código do procedimento deve conter 8 dígitos"
      }
    ],
    allowedFileTypes: ["pdf", "jpg", "png"],
    maxFileSize: 5242880, // 5MB
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    insuranceCompanyId: "2",
    formTitle: "Bradesco - Solicitação de Procedimentos Invasivos",
    requiredFields: [
      "patientName",
      "patientCPF",
      "patientBirthDate",
      "patientPlan",
      "patientCardNumber",
      "procedureCode",
      "procedureName",
      "justification",
      "physicianCRM",
      "physicianSpecialty"
    ],
    validationRules: [
      {
        fieldName: "patientCPF",
        rule: "^[0-9]{11}$",
        errorMessage: "CPF deve conter 11 dígitos numéricos"
      },
      {
        fieldName: "patientCardNumber",
        rule: "^[0-9]{12}$",
        errorMessage: "Número do cartão deve conter 12 dígitos numéricos"
      }
    ],
    allowedFileTypes: ["pdf"],
    maxFileSize: 10485760, // 10MB
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock data for audit rules
let auditRules: InsuranceAuditRule[] = [
  {
    id: "1",
    insuranceCompanyId: "1",
    procedureCode: "48030015",
    procedureName: "Angioplastia Coronária",
    materialLimits: [
      {
        materialCode: "M001",
        materialName: "Stent Farmacológico",
        maxQuantity: 2
      },
      {
        materialCode: "M002",
        materialName: "Balão",
        maxQuantity: 3
      }
    ],
    preApprovedJustifications: [
      "Estenose coronária acima de 70%",
      "Síndrome coronária aguda"
    ],
    requiresSecondOpinion: true,
    requiresPriorAuthorization: true,
    authorizationDocuments: [
      "Laudos de exames anteriores",
      "Relatório médico detalhado"
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    insuranceCompanyId: "2",
    procedureCode: "48030023",
    procedureName: "Cateterismo Cardíaco",
    materialLimits: [
      {
        materialCode: "M003",
        materialName: "Cateter Diagnóstico",
        maxQuantity: 3
      }
    ],
    preApprovedJustifications: [
      "Dor torácica a esclarecer",
      "Avaliação pré-operatória"
    ],
    requiresSecondOpinion: false,
    requiresPriorAuthorization: false,
    authorizationDocuments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Insurance Companies CRUD
export const getInsuranceCompanies = (): Promise<InsuranceCompany[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(insuranceCompanies);
    }, 500);
  });
};

export const getInsuranceCompanyById = (id: string): Promise<InsuranceCompany | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(insuranceCompanies.find(company => company.id === id));
    }, 300);
  });
};

export const createInsuranceCompany = (company: Omit<InsuranceCompany, 'id' | 'createdAt' | 'updatedAt'>): Promise<InsuranceCompany> => {
  return new Promise((resolve) => {
    const newCompany: InsuranceCompany = {
      ...company,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    insuranceCompanies.push(newCompany);
    
    setTimeout(() => {
      resolve(newCompany);
    }, 400);
  });
};

export const updateInsuranceCompany = (id: string, company: Partial<InsuranceCompany>): Promise<InsuranceCompany | undefined> => {
  return new Promise((resolve) => {
    const index = insuranceCompanies.findIndex(c => c.id === id);
    
    if (index !== -1) {
      insuranceCompanies[index] = {
        ...insuranceCompanies[index],
        ...company,
        updatedAt: new Date().toISOString()
      };
      
      setTimeout(() => {
        resolve(insuranceCompanies[index]);
      }, 400);
    } else {
      resolve(undefined);
    }
  });
};

export const deleteInsuranceCompany = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const initialLength = insuranceCompanies.length;
    insuranceCompanies = insuranceCompanies.filter(company => company.id !== id);
    
    setTimeout(() => {
      resolve(insuranceCompanies.length < initialLength);
    }, 300);
  });
};

// Insurance Contracts CRUD
export const getInsuranceContracts = (insuranceCompanyId?: string): Promise<InsuranceContract[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (insuranceCompanyId) {
        resolve(insuranceContracts.filter(contract => contract.insuranceCompanyId === insuranceCompanyId));
      } else {
        resolve(insuranceContracts);
      }
    }, 500);
  });
};

export const getInsuranceContractById = (id: string): Promise<InsuranceContract | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(insuranceContracts.find(contract => contract.id === id));
    }, 300);
  });
};

export const createInsuranceContract = (contract: Omit<InsuranceContract, 'id' | 'createdAt' | 'updatedAt'>): Promise<InsuranceContract> => {
  return new Promise((resolve) => {
    const newContract: InsuranceContract = {
      ...contract,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    insuranceContracts.push(newContract);
    
    setTimeout(() => {
      resolve(newContract);
    }, 400);
  });
};

export const updateInsuranceContract = (id: string, contract: Partial<InsuranceContract>): Promise<InsuranceContract | undefined> => {
  return new Promise((resolve) => {
    const index = insuranceContracts.findIndex(c => c.id === id);
    
    if (index !== -1) {
      insuranceContracts[index] = {
        ...insuranceContracts[index],
        ...contract,
        updatedAt: new Date().toISOString()
      };
      
      setTimeout(() => {
        resolve(insuranceContracts[index]);
      }, 400);
    } else {
      resolve(undefined);
    }
  });
};

export const deleteInsuranceContract = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const initialLength = insuranceContracts.length;
    insuranceContracts = insuranceContracts.filter(contract => contract.id !== id);
    
    setTimeout(() => {
      resolve(insuranceContracts.length < initialLength);
    }, 300);
  });
};

// Form Configurations CRUD
export const getFormConfigs = (insuranceCompanyId?: string): Promise<InsuranceFormConfig[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (insuranceCompanyId) {
        resolve(formConfigs.filter(config => config.insuranceCompanyId === insuranceCompanyId));
      } else {
        resolve(formConfigs);
      }
    }, 500);
  });
};

export const getFormConfigById = (id: string): Promise<InsuranceFormConfig | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(formConfigs.find(config => config.id === id));
    }, 300);
  });
};

export const createFormConfig = (config: Omit<InsuranceFormConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<InsuranceFormConfig> => {
  return new Promise((resolve) => {
    const newConfig: InsuranceFormConfig = {
      ...config,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    formConfigs.push(newConfig);
    
    setTimeout(() => {
      resolve(newConfig);
    }, 400);
  });
};

export const updateFormConfig = (id: string, config: Partial<InsuranceFormConfig>): Promise<InsuranceFormConfig | undefined> => {
  return new Promise((resolve) => {
    const index = formConfigs.findIndex(c => c.id === id);
    
    if (index !== -1) {
      formConfigs[index] = {
        ...formConfigs[index],
        ...config,
        updatedAt: new Date().toISOString()
      };
      
      setTimeout(() => {
        resolve(formConfigs[index]);
      }, 400);
    } else {
      resolve(undefined);
    }
  });
};

export const deleteFormConfig = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const initialLength = formConfigs.length;
    formConfigs = formConfigs.filter(config => config.id !== id);
    
    setTimeout(() => {
      resolve(formConfigs.length < initialLength);
    }, 300);
  });
};

// Audit Rules CRUD
export const getAuditRules = (insuranceCompanyId?: string): Promise<InsuranceAuditRule[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (insuranceCompanyId) {
        resolve(auditRules.filter(rule => rule.insuranceCompanyId === insuranceCompanyId));
      } else {
        resolve(auditRules);
      }
    }, 500);
  });
};

export const getAuditRuleById = (id: string): Promise<InsuranceAuditRule | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(auditRules.find(rule => rule.id === id));
    }, 300);
  });
};

export const createAuditRule = (rule: Omit<InsuranceAuditRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<InsuranceAuditRule> => {
  return new Promise((resolve) => {
    const newRule: InsuranceAuditRule = {
      ...rule,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    auditRules.push(newRule);
    
    setTimeout(() => {
      resolve(newRule);
    }, 400);
  });
};

export const updateAuditRule = (id: string, rule: Partial<InsuranceAuditRule>): Promise<InsuranceAuditRule | undefined> => {
  return new Promise((resolve) => {
    const index = auditRules.findIndex(r => r.id === id);
    
    if (index !== -1) {
      auditRules[index] = {
        ...auditRules[index],
        ...rule,
        updatedAt: new Date().toISOString()
      };
      
      setTimeout(() => {
        resolve(auditRules[index]);
      }, 400);
    } else {
      resolve(undefined);
    }
  });
};

export const deleteAuditRule = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const initialLength = auditRules.length;
    auditRules = auditRules.filter(rule => rule.id !== id);
    
    setTimeout(() => {
      resolve(auditRules.length < initialLength);
    }, 300);
  });
};
