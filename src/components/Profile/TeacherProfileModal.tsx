import React, { useState, useEffect } from 'react';
import { X, User, Mail, GraduationCap, Calendar, Book, Award, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TeacherProfile {
  education: string;
  experience_years: number;
  grades_teaching: string;
  subjects_teaching: string;
  board: string;
}

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<TeacherProfile>({
    education: '',
    experience_years: 0,
    grades_teaching: '',
    subjects_teaching: '',
    board: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/teacher/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditForm(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (profile) {
      setEditForm(profile);
    }
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/teacher/profile/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditForm(data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditForm(profile);
    }
    setIsEditing(false);
  };

  const handleFormChange = (field: keyof TeacherProfile, value: string | number) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Teacher Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                  <p className="text-sm text-blue-600 capitalize font-medium">{user?.role}</p>
                </div>
              </div>

              {/* Profile Information */}
              {profile ? (
                <div>
                  {isEditing ? (
                    /* Edit Form */
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Education</label>
                            <input
                              type="text"
                              value={editForm.education}
                              onChange={(e) => handleFormChange('education', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter your education background"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Experience (Years)</label>
                            <input
                              type="number"
                              value={editForm.experience_years}
                              onChange={(e) => handleFormChange('experience_years', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Years of experience"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Subjects Teaching</label>
                            <input
                              type="text"
                              value={editForm.subjects_teaching}
                              onChange={(e) => handleFormChange('subjects_teaching', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder="e.g., Mathematics, Science"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Grades Teaching</label>
                            <input
                              type="text"
                              value={editForm.grades_teaching}
                              onChange={(e) => handleFormChange('grades_teaching', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder="e.g., 6-12, Primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Board</label>
                            <input
                              type="text"
                              value={editForm.board}
                              onChange={(e) => handleFormChange('board', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder="e.g., CBSE, ICSE"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Contact Email</label>
                            <input
                              type="email"
                              value={user?.email || ''}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <GraduationCap className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Education</p>
                            <p className="text-sm text-gray-600">{profile.education}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Experience</p>
                            <p className="text-sm text-gray-600">{profile.experience_years} years</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Book className="h-5 w-5 text-purple-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Subjects Teaching</p>
                            <p className="text-sm text-gray-600">{profile.subjects_teaching}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <User className="h-5 w-5 text-orange-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Grades Teaching</p>
                            <p className="text-sm text-gray-600">{profile.grades_teaching}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Award className="h-5 w-5 text-red-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Board</p>
                            <p className="text-sm text-gray-600">{profile.board}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Mail className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Contact</p>
                            <p className="text-sm text-gray-600">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No profile information</h3>
                  <p className="mt-1 text-sm text-gray-500">Complete your profile to see your information here.</p>
                  <button
                    onClick={handleEditClick}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Complete Profile
                  </button>
                </div>
              )}

              {/* Quick Stats */}
              {profile && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-lg font-semibold text-blue-600">{profile.experience_years}</p>
                      <p className="text-xs text-gray-600">Years Experience</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-lg font-semibold text-green-600">Active</p>
                      <p className="text-xs text-gray-600">Status</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-lg font-semibold text-purple-600">{profile.board}</p>
                      <p className="text-xs text-gray-600">Curriculum</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-lg font-semibold text-orange-600">Teacher</p>
                      <p className="text-xs text-gray-600">Role</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Close
              </button>
              {profile && (
                <button
                  onClick={handleEditClick}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2 inline" />
                  Edit Profile
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};