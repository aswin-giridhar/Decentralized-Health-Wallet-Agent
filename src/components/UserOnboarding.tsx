import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, OnboardingStep } from '../types/auth';

interface UserOnboardingProps {
  onComplete: () => void;
}

const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete }) => {
  const { state, updateUserProfile, setUserRole, updateKYCStatus } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    role: '' as UserRole | '',
    // Patient fields
    insuranceId: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    medicalConditions: '',
    allergies: '',
    // Healthcare Provider fields
    specialization: '',
    licenseNumber: '',
    hospitalAffiliation: '',
    consultationRate: '',
    // Insurance Company fields
    companyName: '',
    registrationNumber: '',
    coverageTypes: '',
    networkSize: '',
    // Admin fields
    adminLevel: 'department' as 'super' | 'regional' | 'department',
    department: '',
  });

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'role-selection',
      title: 'Select Your Role',
      description: 'Choose your primary role in the healthcare ecosystem',
      completed: false,
      required: true,
    },
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Provide your basic personal information',
      completed: false,
      required: true,
    },
    {
      id: 'role-specific',
      title: 'Professional Details',
      description: 'Add role-specific information',
      completed: false,
      required: true,
    },
    {
      id: 'security-setup',
      title: 'Security Preferences',
      description: 'Configure your security settings',
      completed: false,
      required: true,
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeOnboarding = () => {
    // Ensure role is selected
    if (!formData.role || typeof formData.role !== 'string' || !Object.values(UserRole).includes(formData.role as UserRole)) {
      console.error('Role must be selected before completing onboarding');
      return;
    }

    // Prepare comprehensive profile update with all fields
    const profileUpdate: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
    };

    // Add role-specific fields
    if (formData.role === UserRole.PATIENT) {
      profileUpdate.insuranceId = formData.insuranceId;
      // Add emergency contact as object if provided
      if (formData.emergencyContactName) {
        profileUpdate.emergencyContact = {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship,
        };
      }
      // Add medical info as arrays
      if (formData.medicalConditions) {
        profileUpdate.medicalConditions = formData.medicalConditions.split(',').map(c => c.trim());
      }
      if (formData.allergies) {
        profileUpdate.allergies = formData.allergies.split(',').map(a => a.trim());
      }
    } else if (formData.role === UserRole.HEALTHCARE_PROVIDER) {
      profileUpdate.specialization = formData.specialization;
      profileUpdate.licenseNumber = formData.licenseNumber;
      profileUpdate.hospitalAffiliation = formData.hospitalAffiliation;
      if (formData.consultationRate) {
        profileUpdate.consultationRate = parseFloat(formData.consultationRate);
      }
    } else if (formData.role === UserRole.INSURANCE_COMPANY) {
      profileUpdate.companyName = formData.companyName;
      profileUpdate.registrationNumber = formData.registrationNumber;
      if (formData.coverageTypes) {
        profileUpdate.coverageTypes = formData.coverageTypes.split(',').map(c => c.trim());
      }
      if (formData.networkSize) {
        profileUpdate.networkSize = parseInt(formData.networkSize);
      }
    } else if (formData.role === UserRole.ADMIN) {
      profileUpdate.adminLevel = formData.adminLevel;
      profileUpdate.department = formData.department;
    }

    // Update user profile with all data
    updateUserProfile(profileUpdate);

    // Set user role
    setUserRole(formData.role as UserRole);

    // Update KYC status to basic
    updateKYCStatus({
      verificationLevel: 'basic',
    });

    console.log('🎉 Onboarding completed successfully with profile:', profileUpdate);
    onComplete();
  };

  const renderRoleSelection = () => (
    <div className="content-section">
      <div className="section-header">
        <h2 className="section-title">Select Your Role</h2>
        <p className="text-body" style={{color: 'var(--secondary-600)'}}>
          Choose your primary role to customize your HealthWallet experience
        </p>
      </div>

      <div className="grid grid-2">
        <div 
          className={`premium-card cursor-pointer ${formData.role === UserRole.PATIENT ? 'ring-2 ring-primary-500' : ''}`}
          onClick={() => handleInputChange('role', UserRole.PATIENT)}
          style={{cursor: 'pointer'}}
        >
          <div className="card-content">
            <div className="flex items-center gap-4">
              <div style={{fontSize: '2rem'}}>🏥</div>
              <div>
                <h3 className="card-title">Patient</h3>
                <p className="card-subtitle">Manage your health records and payments</p>
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`premium-card cursor-pointer ${formData.role === UserRole.HEALTHCARE_PROVIDER ? 'ring-2 ring-primary-500' : ''}`}
          onClick={() => handleInputChange('role', UserRole.HEALTHCARE_PROVIDER)}
          style={{cursor: 'pointer'}}
        >
          <div className="card-content">
            <div className="flex items-center gap-4">
              <div style={{fontSize: '2rem'}}>👨‍⚕️</div>
              <div>
                <h3 className="card-title">Healthcare Provider</h3>
                <p className="card-subtitle">Access patient records and process payments</p>
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`premium-card cursor-pointer ${formData.role === UserRole.INSURANCE_COMPANY ? 'ring-2 ring-primary-500' : ''}`}
          onClick={() => handleInputChange('role', UserRole.INSURANCE_COMPANY)}
          style={{cursor: 'pointer'}}
        >
          <div className="card-content">
            <div className="flex items-center gap-4">
              <div style={{fontSize: '2rem'}}>🛡️</div>
              <div>
                <h3 className="card-title">Insurance Company</h3>
                <p className="card-subtitle">Process claims and manage policies</p>
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`premium-card cursor-pointer ${formData.role === UserRole.ADMIN ? 'ring-2 ring-primary-500' : ''}`}
          onClick={() => handleInputChange('role', UserRole.ADMIN)}
          style={{cursor: 'pointer'}}
        >
          <div className="card-content">
            <div className="flex items-center gap-4">
              <div style={{fontSize: '2rem'}}>⚙️</div>
              <div>
                <h3 className="card-title">Administrator</h3>
                <p className="card-subtitle">Manage platform and user access</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBasicInfo = () => (
    <div className="content-section">
      <div className="section-header">
        <h2 className="section-title">Basic Information</h2>
        <p className="text-body" style={{color: 'var(--secondary-600)'}}>
          Provide your basic personal information
        </p>
      </div>

      <div className="premium-card">
        <div className="card-content">
          <div className="grid grid-2">
            <div>
              <label className="form-label">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="form-input"
                placeholder="Enter your first name"
                required
              />
            </div>
            <div>
              <label className="form-label">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="form-input"
                placeholder="Enter your last name"
                required
              />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="form-input"
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRoleSpecific = () => (
    <div className="content-section">
      <div className="section-header">
        <h2 className="section-title">
          {formData.role === UserRole.PATIENT && '🏥 Patient Information'}
          {formData.role === UserRole.HEALTHCARE_PROVIDER && '👨‍⚕️ Provider Credentials'}
          {formData.role === UserRole.INSURANCE_COMPANY && '🛡️ Company Details'}
          {formData.role === UserRole.ADMIN && '⚙️ Administrator Setup'}
        </h2>
        <p className="text-body" style={{color: 'var(--secondary-600)'}}>
          {formData.role === UserRole.PATIENT && 'Provide your health and insurance information'}
          {formData.role === UserRole.HEALTHCARE_PROVIDER && 'Enter your professional credentials and practice details'}
          {formData.role === UserRole.INSURANCE_COMPANY && 'Add your company registration and coverage information'}
          {formData.role === UserRole.ADMIN && 'Configure your administrative access and permissions'}
        </p>
      </div>

      <div className="premium-card">
        <div className="card-content">
          {formData.role === UserRole.PATIENT && (
            <div className="grid grid-2">
              <div>
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Insurance ID</label>
                <input
                  type="text"
                  value={formData.insuranceId}
                  onChange={(e) => handleInputChange('insuranceId', e.target.value)}
                  className="form-input"
                  placeholder="Enter your insurance ID"
                />
              </div>
              <div>
                <label className="form-label">Emergency Contact Name</label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                  className="form-input"
                  placeholder="Full name of emergency contact"
                />
              </div>
              <div>
                <label className="form-label">Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                  className="form-input"
                  placeholder="Emergency contact phone number"
                />
              </div>
              <div>
                <label className="form-label">Relationship</label>
                <select
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                  className="form-input"
                >
                  <option value="">Select relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="child">Child</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="form-label">Medical Conditions (Optional)</label>
                <input
                  type="text"
                  value={formData.medicalConditions}
                  onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Diabetes, Hypertension"
                />
              </div>
              <div className="grid-span-2">
                <label className="form-label">Allergies (Optional)</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Penicillin, Peanuts, Latex"
                />
              </div>
            </div>
          )}

          {formData.role === UserRole.HEALTHCARE_PROVIDER && (
            <div className="grid grid-2">
              <div>
                <label className="form-label">Medical Specialization</label>
                <select
                  value={formData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  className="form-input"
                >
                  <option value="">Select specialization</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="dermatology">Dermatology</option>
                  <option value="endocrinology">Endocrinology</option>
                  <option value="family_medicine">Family Medicine</option>
                  <option value="gastroenterology">Gastroenterology</option>
                  <option value="general_surgery">General Surgery</option>
                  <option value="internal_medicine">Internal Medicine</option>
                  <option value="neurology">Neurology</option>
                  <option value="oncology">Oncology</option>
                  <option value="orthopedics">Orthopedics</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="psychiatry">Psychiatry</option>
                  <option value="radiology">Radiology</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="form-label">Medical License Number</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  className="form-input"
                  placeholder="Enter your medical license number"
                />
              </div>
              <div>
                <label className="form-label">Hospital/Clinic Affiliation</label>
                <input
                  type="text"
                  value={formData.hospitalAffiliation}
                  onChange={(e) => handleInputChange('hospitalAffiliation', e.target.value)}
                  className="form-input"
                  placeholder="Primary hospital or clinic"
                />
              </div>
              <div>
                <label className="form-label">Consultation Rate (USDC)</label>
                <input
                  type="number"
                  value={formData.consultationRate}
                  onChange={(e) => handleInputChange('consultationRate', e.target.value)}
                  className="form-input"
                  placeholder="e.g., 150"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          )}

          {formData.role === UserRole.INSURANCE_COMPANY && (
            <div className="grid grid-2">
              <div>
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="form-input"
                  placeholder="Enter your company name"
                />
              </div>
              <div>
                <label className="form-label">Registration Number</label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                  className="form-input"
                  placeholder="Company registration number"
                />
              </div>
              <div>
                <label className="form-label">Coverage Types</label>
                <input
                  type="text"
                  value={formData.coverageTypes}
                  onChange={(e) => handleInputChange('coverageTypes', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Health, Dental, Vision"
                />
              </div>
              <div>
                <label className="form-label">Network Size</label>
                <input
                  type="number"
                  value={formData.networkSize}
                  onChange={(e) => handleInputChange('networkSize', e.target.value)}
                  className="form-input"
                  placeholder="Number of network providers"
                  min="0"
                />
              </div>
            </div>
          )}

          {formData.role === UserRole.ADMIN && (
            <div className="grid grid-2">
              <div>
                <label className="form-label">Administrator Level</label>
                <select
                  value={formData.adminLevel}
                  onChange={(e) => handleInputChange('adminLevel', e.target.value)}
                  className="form-input"
                >
                  <option value="department">Department Admin</option>
                  <option value="regional">Regional Admin</option>
                  <option value="super">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="form-label">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="form-input"
                >
                  <option value="">Select department</option>
                  <option value="compliance">Compliance</option>
                  <option value="operations">Operations</option>
                  <option value="security">Security</option>
                  <option value="customer_support">Customer Support</option>
                  <option value="finance">Finance</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSecuritySetup = () => (
    <div className="content-section">
      <div className="section-header">
        <h2 className="section-title">Security Preferences</h2>
        <p className="text-body" style={{color: 'var(--secondary-600)'}}>
          Configure your security settings for optimal protection
        </p>
      </div>

      <div className="grid grid-3">
        <div className="premium-card">
          <div className="card-content">
            <h3 className="card-title">🔐 Encryption</h3>
            <p className="card-description">
              Your health records will be encrypted using AES-256 encryption with your wallet as the key.
            </p>
            <span className="status-badge completed">Enabled</span>
          </div>
        </div>

        <div className="premium-card">
          <div className="card-content">
            <h3 className="card-title">🔗 Blockchain Security</h3>
            <p className="card-description">
              All transactions are secured on the TRON blockchain with immutable audit trails.
            </p>
            <span className="status-badge completed">Active</span>
          </div>
        </div>

        <div className="premium-card">
          <div className="card-content">
            <h3 className="card-title">⚖️ Compliance</h3>
            <p className="card-description">
              Automatic HIPAA and GDPR compliance monitoring with real-time alerts.
            </p>
            <span className="status-badge completed">Monitored</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderRoleSelection();
      case 1:
        return renderBasicInfo();
      case 2:
        return renderRoleSpecific();
      case 3:
        return renderSecuritySetup();
      default:
        return renderRoleSelection();
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.role !== ''; // Check if role is selected
      case 1:
        return formData.firstName && formData.lastName && formData.email;
      case 2:
        // Role-specific validation
        if (formData.role === UserRole.HEALTHCARE_PROVIDER) {
          return formData.specialization && formData.licenseNumber;
        }
        if (formData.role === UserRole.INSURANCE_COMPANY) {
          return formData.companyName && formData.registrationNumber;
        }
        if (formData.role === UserRole.ADMIN) {
          return formData.adminLevel && formData.department;
        }
        return true; // Patient role has no required fields in step 2
      case 3:
        return true; // Security setup is automatic
      default:
        return false;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-container">
          <div className="brand">
            <div className="brand-logo">🏥</div>
            <div>
              <h1 className="brand-title">HealthWallet Setup</h1>
              <p className="brand-subtitle">Complete your profile to get started</p>
            </div>
          </div>
          
          <div className="wallet-status">
            <div className="wallet-indicator">
              <div className="status-dot"></div>
              <span>{state.user?.walletAddress.slice(0, 6)}...{state.user?.walletAddress.slice(-4)}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Progress Indicator */}
        <div className="premium-card" style={{marginBottom: 'var(--space-6)'}}>
          <div className="card-content">
            <div className="flex justify-between items-center" style={{marginBottom: 'var(--space-4)'}}>
              <h3 className="card-title">Setup Progress</h3>
              <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>
                Step {currentStep + 1} of {onboardingSteps.length}
              </span>
            </div>
            
            <div className="flex gap-2">
              {onboardingSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex-1 h-2 rounded-full ${
                    index <= currentStep ? 'bg-primary-500' : 'bg-secondary-200'
                  }`}
                  style={{
                    background: index <= currentStep ? 'var(--primary-500)' : 'var(--secondary-200)',
                    transition: 'all var(--transition-normal)'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between items-center" style={{marginTop: 'var(--space-8)'}}>
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="btn btn-secondary"
            style={{opacity: currentStep === 0 ? 0.5 : 1}}
          >
            ← Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="btn btn-primary"
            style={{opacity: !isStepValid() ? 0.5 : 1}}
          >
            {currentStep === onboardingSteps.length - 1 ? 'Complete Setup' : 'Next →'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default UserOnboarding;
