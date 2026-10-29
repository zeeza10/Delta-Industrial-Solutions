/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

export const TARGET_OWNER_EMAIL = '309amaanu@gmail.com';

export type AuthModalMode = 'signin' | 'register' | 'forgot';

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  role: UserRole;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  signIn: () => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<AuthResponse>;
  signInWithEmail: (email: string, password: string) => Promise<AuthResponse>;
  signUpWithEmail: (
    email: string, 
    password: string, 
    profileData?: Partial<UserProfile>
  ) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  sendEmailVerificationLink: () => Promise<AuthResponse>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<AuthResponse>;
  refreshProfile: () => Promise<void>;
  claimOwnerRole: () => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('signin');
  
  const isSigningInRef = useRef(false);

  const fetchProfile = async (currentUser: User) => {
    const isTargetOwner = currentUser.email?.toLowerCase().trim() === TARGET_OWNER_EMAIL;

    if (!db) {
      setProfile({
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || (isTargetOwner ? 'System Owner' : ''),
        role: isTargetOwner ? 'owner' : 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return;
    }

    try {
      const profileRef = doc(db, 'users', currentUser.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const data = profileSnap.data() as UserProfile;
        // If the signed-in user is the designated owner, guarantee owner role in profile
        if (isTargetOwner && data.role !== 'owner') {
          const updatedProfile: UserProfile = {
            ...data,
            role: 'owner',
            updatedAt: new Date().toISOString(),
          };
          try {
            await setDoc(profileRef, { role: 'owner', updatedAt: new Date().toISOString() }, { merge: true });
            // Also ensure admin lookup entry exists
            const adminRef = doc(db, 'admins', currentUser.uid);
            await setDoc(adminRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              role: 'owner',
              verifiedAt: new Date().toISOString(),
            }, { merge: true });
          } catch (writeErr) {
            console.warn('Could not sync owner record to Firestore immediately:', writeErr);
          }
          setProfile(updatedProfile);
        } else {
          setProfile(data);
        }
      } else {
        // Initial profile creation
        const initialRole: UserRole = isTargetOwner ? 'owner' : 'customer';
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || (isTargetOwner ? 'System Owner' : ''),
          role: initialRole,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        try {
          await setDoc(profileRef, newProfile);
          if (isTargetOwner) {
            const adminRef = doc(db, 'admins', currentUser.uid);
            await setDoc(adminRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              role: 'owner',
              verifiedAt: new Date().toISOString(),
            }, { merge: true });
          }
        } catch (e) {
          console.warn('Profile write deferred/offline:', e);
        }
        setProfile(newProfile);
      }
    } catch (err) {
      console.warn('Using local profile fallback due to offline/token state:', err);
      setProfile({
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || (isTargetOwner ? 'System Owner' : ''),
        role: isTargetOwner ? 'owner' : 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser && db) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (mode: AuthModalMode = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signInWithGoogle = async (): Promise<AuthResponse> => {
    if (!auth) {
      return { success: false, error: 'Firebase Auth is unavailable.' };
    }
    if (isSigningInRef.current) {
      return { success: false, error: 'Authentication already in progress. Please check open windows.' };
    }

    isSigningInRef.current = true;
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const userCredential = await signInWithPopup(auth, provider);
      
      // Ensure user document exists in Firestore
      setIsAuthModalOpen(false);
      return { success: true, user: userCredential.user };
    } catch (err: any) {
      let message = 'Unable to sign in with Google.';
      if (err.code === 'auth/popup-blocked') {
        message = 'The sign-in popup was blocked by your browser. Please allow popups or use email & password sign-in.';
      } else if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in was cancelled.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    } finally {
      isSigningInRef.current = false;
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
    if (!auth) {
      return { success: false, error: 'Firebase Auth is unavailable.' };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      setIsAuthModalOpen(false);
      return { success: true, user: userCredential.user };
    } catch (err: any) {
      let message = 'Failed to sign in. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please try again or reset your password.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please provide a valid email address.';
      } else if (err.code === 'auth/user-disabled') {
        message = 'This customer account has been disabled. Please contact support.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    }
  };

  const signUpWithEmail = async (
    email: string, 
    password: string, 
    profileData?: Partial<UserProfile>
  ): Promise<AuthResponse> => {
    if (!auth || !db) {
      return { success: false, error: 'Authentication service is unavailable.' };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const newUser = userCredential.user;

      if (profileData?.displayName) {
        await updateProfile(newUser, { displayName: profileData.displayName });
      }

      // Create profile in Firestore
      const profileRef = doc(db, 'users', newUser.uid);
      const newProfile: UserProfile = {
        uid: newUser.uid,
        email: newUser.email || email.trim(),
        displayName: profileData?.displayName || '',
        company: profileData?.company || '',
        phone: profileData?.phone || '',
        jobTitle: profileData?.jobTitle || '',
        taxId: profileData?.taxId || '',
        role: 'customer',
        shippingAddress: profileData?.shippingAddress,
        billingAddress: profileData?.billingAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(profileRef, newProfile);
      setProfile(newProfile);

      // Attempt to send verification email
      try {
        await sendEmailVerification(newUser);
      } catch (verificationErr) {
        console.warn('Email verification send issue:', verificationErr);
      }

      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      let message = 'Registration failed.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email address already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please provide a valid corporate or professional email.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    }
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    if (!auth) {
      return { success: false, error: 'Authentication service is unavailable.' };
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: any) {
      let message = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please provide a valid email address.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    }
  };

  const sendEmailVerificationLink = async (): Promise<AuthResponse> => {
    if (!auth?.currentUser) {
      return { success: false, error: 'No authenticated user found.' };
    }

    try {
      await sendEmailVerification(auth.currentUser);
      return { success: true };
    } catch (err: any) {
      return { 
        success: false, 
        error: err.code === 'auth/too-many-requests' 
          ? 'Too many attempts. Please check your inbox or try again shortly.' 
          : (err.message || 'Failed to send email verification.')
      };
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>): Promise<AuthResponse> => {
    if (!user || !db) {
      return { success: false, error: 'You must be signed in to update your profile.' };
    }

    try {
      const profileRef = doc(db, 'users', user.uid);
      const updateData: Record<string, any> = {
        ...data,
        updatedAt: new Date().toISOString()
      };

      // Prevent role modification by user
      delete updateData.role;
      delete updateData.uid;

      await updateDoc(profileRef, updateData);

      if (data.displayName && auth?.currentUser) {
        await updateProfile(auth.currentUser, { displayName: data.displayName });
      }

      setProfile(prev => prev ? ({ ...prev, ...data, updatedAt: updateData.updatedAt }) : null);
      return { success: true };
    } catch (err: any) {
      console.error('Error updating profile:', err);
      return { success: false, error: err.message || 'Failed to update profile.' };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  // Backward compatibility method
  const signIn = async (): Promise<AuthResponse> => {
    openAuthModal('signin');
    return { success: true };
  };

  const claimOwnerRole = async (): Promise<AuthResponse> => {
    if (!user || user.email?.toLowerCase().trim() !== TARGET_OWNER_EMAIL) {
      return { 
        success: false, 
        error: `Account ${user?.email || 'unauthenticated'} does not match designated administrative owner (${TARGET_OWNER_EMAIL}).` 
      };
    }
    if (!db) {
      return { success: false, error: 'Database service is currently unreachable.' };
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const adminRef = doc(db, 'admins', user.uid);
      const now = new Date().toISOString();

      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'System Owner',
        role: 'owner',
        updatedAt: now,
      }, { merge: true });

      await setDoc(adminRef, {
        uid: user.uid,
        email: user.email,
        role: 'owner',
        verifiedAt: now,
      }, { merge: true });

      await fetchProfile(user);
      return { success: true };
    } catch (err: any) {
      console.error('Failed to provision owner record:', err);
      return { success: false, error: err.message || 'Failed to claim owner authorization.' };
    }
  };

  const isOwner = (profile?.role === 'owner') || (user?.email?.toLowerCase().trim() === TARGET_OWNER_EMAIL);
  const isAdmin = isOwner || profile?.role === 'admin' || profile?.role === 'manager';
  const isStaff = isAdmin;
  const role: UserRole = profile?.role || (isOwner ? 'owner' : 'customer');

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isOwner,
      isAdmin, 
      isStaff,
      role,
      isAuthModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      signIn,
      signInWithGoogle, 
      signInWithEmail,
      signUpWithEmail,
      signOut,
      resetPassword,
      sendEmailVerificationLink,
      updateUserProfile,
      refreshProfile,
      claimOwnerRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
