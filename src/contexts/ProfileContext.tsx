import React, { createContext, useContext, useState, useEffect } from 'react';
import { TeacherProfile } from '@/types';
import apiService from '@/services/api';
import { useAuth } from './AuthContext';

interface ProfileContextType {
  profile: TeacherProfile | null;
  loading: boolean;
  hasProfile: boolean;
  fetchProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: React.ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const { user, isAuthenticated } = useAuth();

  const fetchProfile = async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      setProfile(null);
      return;
    }

    if (user.role !== 'teacher') {
      setLoading(false);
      setProfile(null);
      return;
    }

    try {
      setLoading(true);
      const profileData = await apiService.getTeacherProfile();
      setProfile(profileData);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Failed to fetch profile:', error);
      }
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [isAuthenticated, user]);

  const value: ProfileContextType = {
    profile,
    loading,
    hasProfile: !!profile,
    fetchProfile,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};