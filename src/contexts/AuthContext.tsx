import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthState, KYCStatus, UserProfile } from '../types/auth';

// Auth Context
interface AuthContextType {
  state: AuthState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  updateKYCStatus: (kyc: Partial<KYCStatus>) => void;
  setUserRole: (role: UserRole) => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'WALLET_CONNECTED'; payload: { address: string } }
  | { type: 'WALLET_DISCONNECTED' }
  | { type: 'USER_AUTHENTICATED'; payload: User }
  | { type: 'USER_PROFILE_UPDATED'; payload: Partial<UserProfile> }
  | { type: 'KYC_STATUS_UPDATED'; payload: Partial<KYCStatus> }
  | { type: 'USER_ROLE_SET'; payload: UserRole };

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'WALLET_CONNECTED':
      return {
        ...state,
        walletConnected: true,
        loading: false,
        error: null,
      };
    
    case 'WALLET_DISCONNECTED':
      return {
        ...state,
        walletConnected: false,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    
    case 'USER_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    
    case 'USER_PROFILE_UPDATED':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          profile: { ...state.user.profile, ...action.payload }
        } : null,
      };
    
    case 'KYC_STATUS_UPDATED':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          kyc: { ...state.user.kyc, ...action.payload }
        } : null,
      };
    
    case 'USER_ROLE_SET':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          role: action.payload
        } : null,
      };
    
    default:
      return state;
  }
};

// Initial State
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  walletConnected: false,
  loading: false,
  error: null,
};

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Connect to TRON wallet
  const connectWallet = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      if (window.tronWeb && window.tronWeb.ready) {
        const address = window.tronWeb.defaultAddress.base58;
        
        dispatch({ type: 'WALLET_CONNECTED', payload: { address } });
        
        // Check if user exists in local storage or create new user
        const existingUser = localStorage.getItem(`user_${address}`);
        
        if (existingUser) {
          const user: User = JSON.parse(existingUser);
          user.lastLogin = Date.now();
          localStorage.setItem(`user_${address}`, JSON.stringify(user));
          dispatch({ type: 'USER_AUTHENTICATED', payload: user });
        } else {
          // Create new user with default patient role
          const newUser: User = {
            id: `user_${Date.now()}`,
            walletAddress: address,
            role: UserRole.PATIENT,
            profile: {
              firstName: '',
              lastName: '',
              email: '',
            },
            kyc: {
              isVerified: false,
              verificationLevel: 'none',
              documents: [],
            },
            createdAt: Date.now(),
            lastLogin: Date.now(),
          };
          
          localStorage.setItem(`user_${address}`, JSON.stringify(newUser));
          dispatch({ type: 'USER_AUTHENTICATED', payload: newUser });
        }
        
        console.log('🔗 Wallet connected and user authenticated:', address);
      } else {
        throw new Error('Please install TronLink wallet extension');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to connect wallet' });
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    dispatch({ type: 'WALLET_DISCONNECTED' });
    console.log('🔌 Wallet disconnected');
  };

  // Update user profile
  const updateUserProfile = (profileUpdate: Partial<UserProfile>) => {
    if (state.user) {
      const updatedUser = {
        ...state.user,
        profile: { ...state.user.profile, ...profileUpdate }
      };
      
      localStorage.setItem(`user_${state.user.walletAddress}`, JSON.stringify(updatedUser));
      dispatch({ type: 'USER_PROFILE_UPDATED', payload: profileUpdate });
      
      console.log('👤 User profile updated:', profileUpdate);
    }
  };

  // Update KYC status
  const updateKYCStatus = (kycUpdate: Partial<KYCStatus>) => {
    if (state.user) {
      const updatedUser = {
        ...state.user,
        kyc: { ...state.user.kyc, ...kycUpdate }
      };
      
      localStorage.setItem(`user_${state.user.walletAddress}`, JSON.stringify(updatedUser));
      dispatch({ type: 'KYC_STATUS_UPDATED', payload: kycUpdate });
      
      console.log('🔐 KYC status updated:', kycUpdate);
    }
  };

  // Set user role
  const setUserRole = (role: UserRole) => {
    if (state.user) {
      const updatedUser = {
        ...state.user,
        role
      };
      
      localStorage.setItem(`user_${state.user.walletAddress}`, JSON.stringify(updatedUser));
      dispatch({ type: 'USER_ROLE_SET', payload: role });
      
      console.log('👥 User role updated:', role);
    }
  };

  // Check permissions based on role
  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;
    
    // Import permissions dynamically to avoid circular dependency
    const rolePermissions = {
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

    const userPermissions = rolePermissions[state.user.role];
    return (userPermissions as any)[permission] || false;
  };

  // Check wallet connection on mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.tronWeb && window.tronWeb.ready) {
        const address = window.tronWeb.defaultAddress.base58;
        if (address) {
          await connectWallet();
        }
      }
    };

    checkWalletConnection();
    
    // Set up periodic wallet check
    const interval = setInterval(checkWalletConnection, 3000);
    return () => clearInterval(interval);
  }, []);

  const contextValue: AuthContextType = {
    state,
    connectWallet,
    disconnectWallet,
    updateUserProfile,
    updateKYCStatus,
    setUserRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for role-based access
interface WithRoleProps {
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export const withRole = <P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[],
  fallback?: ReactNode
) => {
  return (props: P) => {
    const { state } = useAuth();
    
    if (!state.isAuthenticated || !state.user) {
      return fallback || <div>Please authenticate to access this feature.</div>;
    }
    
    if (!allowedRoles.includes(state.user.role)) {
      return fallback || <div>You don't have permission to access this feature.</div>;
    }
    
    return <Component {...props} />;
  };
};

// Permission-based component wrapper
interface PermissionGuardProps {
  permission: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  fallback,
  children,
}) => {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(permission)) {
    return <>{fallback || <div>You don't have permission to access this feature.</div>}</>;
  }
  
  return <>{children}</>;
};
