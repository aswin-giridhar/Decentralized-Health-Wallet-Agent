import React, { useState, useEffect } from 'react';
import './App.css';
import HealthRecordUpload from './components/HealthRecordUpload';
import PaymentProcessor from './components/PaymentProcessor';
import IntegratedDemo from './components/IntegratedDemo';
import TelemedicineDemo from './components/TelemedicineDemo';
import UserOnboarding from './components/UserOnboarding';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import TronWeb for TRON blockchain integration
declare global {
  interface Window {
    tronWeb: any;
  }
}

interface HealthRecord {
  id: string;
  name: string;
  type: string;
  content: string;
  encrypted: boolean;
  timestamp: number;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  recipient: string;
  purpose: string;
  status: string;
  timestamp: number;
}

// Main App Component with Authentication
const AppContent: React.FC = () => {
  const { state, connectWallet, disconnectWallet } = useAuth();
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [onboardingJustCompleted, setOnboardingJustCompleted] = useState(false);

  // Check if user needs onboarding (only for profile tab, not for demo access)
  useEffect(() => {
    // Skip validation if onboarding was just completed
    if (onboardingJustCompleted) {
      console.log('🎉 Onboarding just completed - skipping validation');
      return;
    }

    if (state.isAuthenticated && state.user) {
      console.log('🔍 Checking profile completion for user:', state.user.profile);
      
      const hasBasicInfo = state.user.profile.firstName && 
                          state.user.profile.lastName && 
                          state.user.profile.email;
      
      console.log('📋 Basic info complete:', hasBasicInfo);
      
      // Check role-specific completion - only if basic info exists
      let hasRoleSpecificInfo = true;
      if (hasBasicInfo) {
        if (state.user.role === 'healthcare_provider') {
          hasRoleSpecificInfo = !!(state.user.profile.specialization && state.user.profile.licenseNumber);
          console.log('👨‍⚕️ Healthcare provider info:', {
            specialization: state.user.profile.specialization,
            licenseNumber: state.user.profile.licenseNumber,
            complete: hasRoleSpecificInfo
          });
        } else if (state.user.role === 'insurance_company') {
          hasRoleSpecificInfo = !!(state.user.profile.companyName && state.user.profile.registrationNumber);
          console.log('🛡️ Insurance company info:', {
            companyName: state.user.profile.companyName,
            registrationNumber: state.user.profile.registrationNumber,
            complete: hasRoleSpecificInfo
          });
        } else if (state.user.role === 'admin') {
          hasRoleSpecificInfo = !!(state.user.profile.adminLevel && state.user.profile.department);
          console.log('⚙️ Admin info:', {
            adminLevel: state.user.profile.adminLevel,
            department: state.user.profile.department,
            complete: hasRoleSpecificInfo
          });
        } else if (state.user.role === 'patient') {
          // Patient role doesn't require additional fields for basic completion
          hasRoleSpecificInfo = true;
          console.log('🏥 Patient info: No additional fields required');
        }
      }
      
      // Only show onboarding if accessing profile tab and profile is incomplete
      const needsOnboarding = !hasBasicInfo || !hasRoleSpecificInfo;
      
      console.log('🎯 Profile completion status:', {
        hasBasicInfo,
        hasRoleSpecificInfo,
        needsOnboarding,
        activeTab,
        currentRole: state.user.role,
        onboardingJustCompleted
      });
      
      // Don't force onboarding if user is on demo tab
      if (activeTab === 'demo') {
        setShowOnboarding(false);
        console.log('🎬 Demo tab active - skipping onboarding check');
      } else if (activeTab === 'profile') {
        // Only show onboarding if profile is incomplete AND user manually clicked edit
        if (needsOnboarding && !showOnboarding) {
          console.log('👤 Profile incomplete but not forcing onboarding - user must click Edit Profile');
        }
        console.log('👤 Profile tab active - onboarding needed:', needsOnboarding);
      } else {
        // For other tabs, only show onboarding if profile is completely empty
        const isCompletelyEmpty = !hasBasicInfo;
        if (isCompletelyEmpty) {
          setShowOnboarding(true);
        }
        console.log('📑 Other tab active - onboarding needed only if empty:', isCompletelyEmpty);
      }
    }
  }, [state.isAuthenticated, state.user, activeTab, onboardingJustCompleted, showOnboarding]);

  // Load demo data
  useEffect(() => {
    // Demo health records
    const demoRecords: HealthRecord[] = [
      {
        id: '1',
        name: 'Blood Test Results',
        type: 'Lab Report',
        content: 'Cholesterol: 180 mg/dL, Glucose: 95 mg/dL, Hemoglobin: 14.2 g/dL',
        encrypted: true,
        timestamp: Date.now() - 86400000
      },
      {
        id: '2',
        name: 'X-Ray Chest',
        type: 'Imaging',
        content: 'Normal chest X-ray, no abnormalities detected',
        encrypted: true,
        timestamp: Date.now() - 172800000
      }
    ];
    
    setHealthRecords(demoRecords);
  }, []);

  const handleRecordAdded = (newRecord: HealthRecord) => {
    setHealthRecords(prev => [newRecord, ...prev]);
  };

  const handlePaymentProcessed = (newPayment: Payment) => {
    setPayments(prev => [newPayment, ...prev]);
  };


  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const handleOnboardingComplete = () => {
    console.log('🎉 Onboarding completed successfully');
    setShowOnboarding(false);
    setOnboardingJustCompleted(true);
    
    // Redirect to demo tab after completion to avoid validation issues
    setActiveTab('demo');
    
    // Reset the completion flag after a short delay
    setTimeout(() => {
      setOnboardingJustCompleted(false);
      console.log('✅ Onboarding completion flag reset');
    }, 2000);
  };

  // Show onboarding if user needs to complete profile
  if (showOnboarding && state.isAuthenticated) {
    return <UserOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="brand">
            <div className="brand-logo">🏥</div>
            <div>
              <h1 className="brand-title">HealthWallet</h1>
              <p className="brand-subtitle">Premium Healthcare Fintech Platform</p>
            </div>
          </div>
          
          <div className="wallet-status">
            {state.walletConnected && state.user ? (
              <div className="flex items-center gap-4">
                <div className="wallet-indicator">
                  <div className="status-dot"></div>
                  <span>{formatAddress(state.user.walletAddress)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>
                    {state.user.profile.firstName || 'User'}
                  </span>
                  <span className="status-badge" style={{
                    background: state.user.role === 'patient' ? 'var(--primary-100)' : 
                               state.user.role === 'healthcare_provider' ? 'var(--success-100)' : 
                               state.user.role === 'insurance_company' ? 'var(--info-100)' : 'var(--warning-100)',
                    color: state.user.role === 'patient' ? 'var(--primary-700)' : 
                           state.user.role === 'healthcare_provider' ? 'var(--success-700)' : 
                           state.user.role === 'insurance_company' ? 'var(--info-700)' : 'var(--warning-700)'
                  }}>
                    {state.user.role.replace('_', ' ')}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    console.log('🚪 Logout clicked - resetting all states');
                    disconnectWallet();
                    setDemoMode(false);
                    setActiveTab('profile');
                    setShowOnboarding(false);
                    setShowUploadModal(false);
                    setPayments([]);
                    console.log('✅ All states reset, should return to welcome screen');
                  }} 
                  className="btn btn-secondary"
                  style={{padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)'}}
                >
                  <span>🚪</span>
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={connectWallet} className="btn btn-primary" disabled={state.loading}>
                <span>🔗</span>
                {state.loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {!state.walletConnected && !demoMode ? (
          <div className="welcome-section">
            <h2 className="welcome-title">Welcome to HealthWallet</h2>
            <p className="welcome-subtitle">
              The future of healthcare payments and data management. Secure, compliant, and powered by blockchain technology.
            </p>
            <div className="flex flex-col gap-4 items-center">
              <button onClick={connectWallet} className="cta-button">
                <span>🚀</span>
                Connect Your Wallet to Get Started
              </button>
              <button 
                onClick={() => setDemoMode(true)} 
                className="btn btn-secondary"
                style={{padding: 'var(--space-3) var(--space-6)'}}
              >
                <span>🎬</span>
                Try Interactive Demo
              </button>
            </div>
          </div>
        ) : (
          <div className="content-section">
            {/* Navigation Tabs */}
            <div className="nav-tabs">
              <button
                onClick={() => setActiveTab('profile')}
                className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
              >
                <span className="nav-tab-icon">👤</span>
                Profile
              </button>
              <button
                onClick={() => setActiveTab('records')}
                className={`nav-tab ${activeTab === 'records' ? 'active' : ''}`}
              >
                <span className="nav-tab-icon">📄</span>
                Health Records
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`nav-tab ${activeTab === 'payments' ? 'active' : ''}`}
              >
                <span className="nav-tab-icon">💳</span>
                Payments
              </button>
              <button
                onClick={() => setActiveTab('compliance')}
                className={`nav-tab ${activeTab === 'compliance' ? 'active' : ''}`}
              >
                <span className="nav-tab-icon">⚖️</span>
                Compliance
              </button>
              <button
                onClick={() => setActiveTab('demo')}
                className={`nav-tab ${activeTab === 'demo' ? 'active' : ''}`}
              >
                <span className="nav-tab-icon">🎬</span>
                Demo
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'profile' && state.user && (
              <div className="content-section">
                <div className="section-header">
                  <h2 className="section-title">User Profile</h2>
                  <button 
                    onClick={() => setShowOnboarding(true)}
                    className="btn btn-secondary"
                  >
                    <span>✏️</span>
                    Edit Profile
                  </button>
                </div>
                
                <div className="grid grid-2">
                  {/* Basic Information */}
                  <div className="premium-card">
                    <div className="card-content">
                      <h3 className="card-title">Basic Information</h3>
                      <div className="flex flex-col gap-3" style={{marginTop: 'var(--space-4)'}}>
                        <div className="flex justify-between items-center">
                          <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Name:</span>
                          <span className="text-body-sm" style={{color: 'var(--secondary-900)'}}>
                            {state.user.profile.firstName} {state.user.profile.lastName}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Email:</span>
                          <span className="text-body-sm" style={{color: 'var(--secondary-900)'}}>
                            {state.user.profile.email}
                          </span>
                        </div>
                        {state.user.profile.phone && (
                          <div className="flex justify-between items-center">
                            <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Phone:</span>
                            <span className="text-body-sm" style={{color: 'var(--secondary-900)'}}>
                              {state.user.profile.phone}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Role:</span>
                          <span className="status-badge" style={{
                            background: state.user.role === 'patient' ? 'var(--primary-100)' : 
                                       state.user.role === 'healthcare_provider' ? 'var(--success-100)' : 
                                       state.user.role === 'insurance_company' ? 'var(--info-100)' : 'var(--warning-100)',
                            color: state.user.role === 'patient' ? 'var(--primary-700)' : 
                                   state.user.role === 'healthcare_provider' ? 'var(--success-700)' : 
                                   state.user.role === 'insurance_company' ? 'var(--info-700)' : 'var(--warning-700)'
                          }}>
                            {state.user.role.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Role-Specific Information */}
                  <div className="premium-card">
                    <div className="card-content">
                      <h3 className="card-title">
                        {state.user.role === 'patient' && 'Patient Information'}
                        {state.user.role === 'healthcare_provider' && 'Provider Credentials'}
                        {state.user.role === 'insurance_company' && 'Company Details'}
                        {state.user.role === 'admin' && 'Administrator Details'}
                      </h3>
                      <div className="flex flex-col gap-3" style={{marginTop: 'var(--space-4)'}}>
                        {state.user.role === 'patient' && (
                          <>
                            {state.user.profile.insuranceId && (
                              <div className="flex justify-between items-center">
                                <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Insurance ID:</span>
                                <span className="text-body-sm" style={{color: 'var(--secondary-900)'}}>
                                  {state.user.profile.insuranceId}
                                </span>
                              </div>
                            )}
                            {state.user.profile.dateOfBirth && (
                              <div className="flex justify-between items-center">
                                <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Date of Birth:</span>
                                <span className="text-body-sm" style={{color: 'var(--secondary-900)'}}>
                                  {new Date(state.user.profile.dateOfBirth).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        
                        {state.user.role === 'healthcare_provider' && (
                          <>
                            {state.user.profile.specialization && (
                              <div className="flex justify-between items-center">
                                <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Specialization:</span>
                                <span className="text-body-sm" style={{color: 'var(--secondary-900)'}}>
                                  {state.user.profile.specialization}
                                </span>
                              </div>
                            )}
                            {state.user.profile.licenseNumber && (
                              <div className="flex justify-between items-center">
                                <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>License Number:</span>
                                <span className="text-body-sm" style={{color: 'var(--secondary-900)'}}>
                                  {state.user.profile.licenseNumber}
                                </span>
                              </div>
                            )}
                            {state.user.profile.hospitalAffiliation && (
                              <div className="flex justify-between items-center">
                                <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Hospital/Clinic:</span>
                                <span className="text-body-sm" style={{color: 'var(--secondary-900)'}}>
                                  {state.user.profile.hospitalAffiliation}
                                </span>
                              </div>
                            )}
                            {state.user.profile.consultationRate && (
                              <div className="flex justify-between items-center">
                                <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Consultation Rate:</span>
                                <span className="text-body-sm" style={{color: 'var(--secondary-900)'}}>
                                  ${state.user.profile.consultationRate} USDC
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        
                        {state.user.role === 'insurance_company' && (
                          <>
                            {state.user.profile.companyName && (
                              <div className="flex justify-between items-center">
                                <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Company Name:</span>
                                <span className="text-body-sm" style={{color: 'var(--secondary-900)'}}>
                                  {state.user.profile.companyName}
                                </span>
                              </div>
                            )}
                            {state.user.profile.registrationNumber && (
                              <div className="flex justify-between items-center">
                                <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Registration Number:</span>
                                <span className="text-body-sm" style={{color: 'var(--secondary-900)'}}>
                                  {state.user.profile.registrationNumber}
                                </span>
                              </div>
                            )}
                            {state.user.profile.networkSize && (
                              <div className="flex justify-between items-center">
                                <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Network Size:</span>
                                <span className="text-body-sm" style={{color: 'var(--secondary-900)'}}>
                                  {state.user.profile.networkSize} providers
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        
                        {state.user.role === 'admin' && (
                          <>
                            {state.user.profile.adminLevel && (
                              <div className="flex justify-between items-center">
                                <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Admin Level:</span>
                                <span className="text-body-sm" style={{color: 'var(--secondary-900)'}}>
                                  {state.user.profile.adminLevel.replace('_', ' ')}
                                </span>
                              </div>
                            )}
                            {state.user.profile.department && (
                              <div className="flex justify-between items-center">
                                <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Department:</span>
                                <span className="text-body-sm" style={{color: 'var(--secondary-900)'}}>
                                  {state.user.profile.department.replace('_', ' ')}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="premium-card">
                    <div className="card-content">
                      <h3 className="card-title">Account Information</h3>
                      <div className="flex flex-col gap-3" style={{marginTop: 'var(--space-4)'}}>
                        <div className="flex justify-between items-center">
                          <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Wallet Address:</span>
                          <span className="text-body-sm" style={{color: 'var(--secondary-900)', fontFamily: 'monospace'}}>
                            {formatAddress(state.user.walletAddress)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Member Since:</span>
                          <span className="text-body-sm" style={{color: 'var(--secondary-900)'}}>
                            {new Date(state.user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Last Login:</span>
                          <span className="text-body-sm" style={{color: 'var(--secondary-900)'}}>
                            {new Date(state.user.lastLogin).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>KYC Status:</span>
                          <span className="status-badge" style={{
                            background: state.user.kyc.verificationLevel === 'premium' ? 'var(--success-100)' : 
                                       state.user.kyc.verificationLevel === 'advanced' ? 'var(--info-100)' : 
                                       state.user.kyc.verificationLevel === 'basic' ? 'var(--warning-100)' : 'var(--error-100)',
                            color: state.user.kyc.verificationLevel === 'premium' ? 'var(--success-700)' : 
                                   state.user.kyc.verificationLevel === 'advanced' ? 'var(--info-700)' : 
                                   state.user.kyc.verificationLevel === 'basic' ? 'var(--warning-700)' : 'var(--error-700)'
                          }}>
                            {state.user.kyc.verificationLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div className="premium-card">
                    <div className="card-content">
                      <h3 className="card-title">Security Settings</h3>
                      <div className="flex flex-col gap-3" style={{marginTop: 'var(--space-4)'}}>
                        <div className="flex justify-between items-center">
                          <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Encryption:</span>
                          <span className="status-badge completed">AES-256 Enabled</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Blockchain Security:</span>
                          <span className="status-badge completed">TRON Network</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-body-sm" style={{color: 'var(--secondary-600)'}}>Compliance Monitoring:</span>
                          <span className="status-badge processing">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'records' && (
              <div className="content-section">
                <div className="section-header">
                  <h2 className="section-title">Health Records</h2>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="btn btn-primary"
                  >
                    <span>+</span>
                    Add Record
                  </button>
                </div>
                
                <div className="grid grid-2">
                  {healthRecords.map((record) => (
                    <div key={record.id} className="premium-card">
                      <div className="card-content">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="card-title">{record.name}</h3>
                            <p className="card-subtitle">{record.type}</p>
                            <p className="card-description">{record.content}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="status-badge encrypted">
                              🔒 Encrypted
                            </span>
                            <span className="text-body-sm" style={{color: 'var(--secondary-500)'}}>
                              {formatTimestamp(record.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="content-section">
                <div className="section-header">
                  <h2 className="section-title">Payments</h2>
                </div>
                
                <PaymentProcessor 
                  onPaymentProcessed={handlePaymentProcessed}
                  walletAddress={state.user?.walletAddress || ''}
                />
                
                {payments.length > 0 && (
                  <div className="premium-card" style={{marginTop: 'var(--space-6)'}}>
                    <div className="card-content">
                      <h3 className="card-title">Payment History</h3>
                      <div className="flex flex-col gap-4" style={{marginTop: 'var(--space-4)'}}>
                        {payments.map((payment) => (
                          <div key={payment.id} className="flex justify-between items-center" style={{padding: 'var(--space-3) 0', borderBottom: '1px solid var(--secondary-100)'}}>
                            <div>
                              <p className="card-title" style={{marginBottom: 'var(--space-1)', fontSize: 'var(--text-base)'}}>{payment.purpose}</p>
                              <p className="card-subtitle">{payment.recipient}</p>
                            </div>
                            <div style={{textAlign: 'right'}}>
                              <p className="card-title" style={{marginBottom: 'var(--space-1)', fontSize: 'var(--text-base)'}}>{payment.amount} {payment.currency}</p>
                              <span className="status-badge completed">{payment.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="content-section">
                <div className="section-header">
                  <h2 className="section-title">Compliance Dashboard</h2>
                </div>
                
                <div className="grid grid-3">
                  <div className="premium-card">
                    <div className="card-content">
                      <h3 className="card-title">HIPAA Compliance</h3>
                      <div className="flex items-center gap-2" style={{marginTop: 'var(--space-2)'}}>
                        <div className="status-dot"></div>
                        <span className="status-badge completed">Compliant</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="premium-card">
                    <div className="card-content">
                      <h3 className="card-title">GDPR Compliance</h3>
                      <div className="flex items-center gap-2" style={{marginTop: 'var(--space-2)'}}>
                        <div className="status-dot"></div>
                        <span className="status-badge completed">Compliant</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="premium-card">
                    <div className="card-content">
                      <h3 className="card-title">Audit Trail</h3>
                      <div className="flex items-center gap-2" style={{marginTop: 'var(--space-2)'}}>
                        <div style={{width: '8px', height: '8px', borderRadius: '50%', background: 'var(--info-500)'}}></div>
                        <span className="status-badge processing">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="premium-card">
                  <div className="card-content">
                    <h3 className="card-title">Recent Compliance Events</h3>
                    <div className="flex flex-col gap-3" style={{marginTop: 'var(--space-4)'}}>
                      <div className="flex justify-between items-center" style={{padding: 'var(--space-2) 0', borderBottom: '1px solid var(--secondary-100)'}}>
                        <span className="text-body-sm" style={{color: 'var(--secondary-700)'}}>Payment regulatory split applied</span>
                        <span className="text-body-sm" style={{color: 'var(--secondary-500)'}}>2 minutes ago</span>
                      </div>
                      <div className="flex justify-between items-center" style={{padding: 'var(--space-2) 0', borderBottom: '1px solid var(--secondary-100)'}}>
                        <span className="text-body-sm" style={{color: 'var(--secondary-700)'}}>Health record access logged</span>
                        <span className="text-body-sm" style={{color: 'var(--secondary-500)'}}>5 minutes ago</span>
                      </div>
                      <div className="flex justify-between items-center" style={{padding: 'var(--space-2) 0'}}>
                        <span className="text-body-sm" style={{color: 'var(--secondary-700)'}}>Encryption verification completed</span>
                        <span className="text-body-sm" style={{color: 'var(--secondary-500)'}}>10 minutes ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'demo' && (
              <div className="content-section">
                <div className="section-header">
                  <h2 className="section-title">Interactive Demo</h2>
                </div>
                
                <TelemedicineDemo />
                
                <div style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-8)', borderTop: '2px solid var(--secondary-200)' }}>
                  <h3 style={{ marginBottom: 'var(--space-6)', color: 'var(--primary-600)', fontFamily: 'var(--font-family-display)', fontSize: 'var(--text-2xl)', fontWeight: '600' }}>Service Integration Demo</h3>
                  <IntegratedDemo />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showUploadModal && (
        <HealthRecordUpload
          onRecordAdded={handleRecordAdded}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
};

// Root App Component with Auth Provider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
