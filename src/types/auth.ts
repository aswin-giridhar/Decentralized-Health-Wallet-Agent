// Authentication and User Management Types

export interface User {
  id: string;
  walletAddress: string;
  role: UserRole;
  profile: UserProfile;
  kyc: KYCStatus;
  createdAt: number;
  lastLogin: number;
}

export enum UserRole {
  PATIENT = 'patient',
  HEALTHCARE_PROVIDER = 'healthcare_provider',
  INSURANCE_COMPANY = 'insurance_company',
  ADMIN = 'admin'
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  avatar?: string;
  // Patient-specific fields
  insuranceId?: string;
  emergencyContact?: EmergencyContact;
  medicalConditions?: string[];
  allergies?: string[];
  // Healthcare Provider-specific fields
  specialization?: string;
  licenseNumber?: string;
  hospitalAffiliation?: string;
  consultationRate?: number;
  availableHours?: AvailabilitySchedule;
  // Insurance Company-specific fields
  companyName?: string;
  registrationNumber?: string;
  coverageTypes?: string[];
  networkSize?: number;
  // Admin-specific fields
  adminLevel?: 'super' | 'regional' | 'department';
  permissions?: string[];
  department?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface AvailabilitySchedule {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

export interface KYCStatus {
  isVerified: boolean;
  verificationLevel: 'none' | 'basic' | 'advanced' | 'premium';
  documents: KYCDocument[];
  verifiedAt?: number;
  expiresAt?: number;
}

export interface KYCDocument {
  id: string;
  type: 'passport' | 'drivers_license' | 'national_id' | 'medical_license' | 'insurance_certificate';
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: number;
  verifiedAt?: number;
  expiresAt?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  walletConnected: boolean;
  loading: boolean;
  error: string | null;
}

export interface SecurityPreferences {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  sessionTimeout: number; // in minutes
  allowedDevices: string[];
  encryptionKey?: string;
  backupPhrase?: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export interface RolePermissions {
  canViewRecords: boolean;
  canEditRecords: boolean;
  canDeleteRecords: boolean;
  canProcessPayments: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canAccessCompliance: boolean;
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.PATIENT]: {
    canViewRecords: true,
    canEditRecords: true,
    canDeleteRecords: true,
    canProcessPayments: true,
    canViewAnalytics: true,
    canManageUsers: false,
    canAccessCompliance: false,
  },
  [UserRole.HEALTHCARE_PROVIDER]: {
    canViewRecords: true,
    canEditRecords: false,
    canDeleteRecords: false,
    canProcessPayments: true,
    canViewAnalytics: true,
    canManageUsers: false,
    canAccessCompliance: true,
  },
  [UserRole.INSURANCE_COMPANY]: {
    canViewRecords: true,
    canEditRecords: false,
    canDeleteRecords: false,
    canProcessPayments: true,
    canViewAnalytics: true,
    canManageUsers: false,
    canAccessCompliance: true,
  },
  [UserRole.ADMIN]: {
    canViewRecords: true,
    canEditRecords: true,
    canDeleteRecords: true,
    canProcessPayments: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canAccessCompliance: true,
  },
};
