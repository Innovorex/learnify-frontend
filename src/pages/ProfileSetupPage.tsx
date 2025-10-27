import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { TeacherProfileInput } from '@/types';
import { useProfile } from '@/contexts/ProfileContext';
import apiService from '@/services/api';
import { toast } from 'sonner';

export const ProfileSetupPage: React.FC = () => {
  const [profile, setProfile] = useState<TeacherProfileInput>({
    education: '',
    grades_teaching: '',
    subjects_teaching: '',
    experience_years: 0,
    board: 'CBSE',
    state: 'Telangana',
  });
  const [errors, setErrors] = useState<Partial<TeacherProfileInput>>({});
  const [loading, setLoading] = useState(false);
  const { fetchProfile } = useProfile();
  const navigate = useNavigate();

  const boards = [
    'CBSE',
    'ICSE',
    'State Board',
    'IB',
    'IGCSE',
    'Other'
  ];

  const states = [
    'Telangana',
    'Andhra Pradesh',
    'Karnataka',
    'Tamil Nadu',
    'Maharashtra',
    'Kerala',
    'Gujarat',
    'Rajasthan',
    'Uttar Pradesh',
    'West Bengal',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const parsedValue = name === 'experience_years' ? parseInt(value) || 0 : value;

    setProfile(prev => ({ ...prev, [name]: parsedValue }));

    // Clear error when user starts typing
    if (errors[name as keyof TeacherProfileInput]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TeacherProfileInput> = {};

    if (!profile.education.trim()) {
      newErrors.education = 'Education is required';
    }

    if (!profile.grades_teaching.trim()) {
      newErrors.grades_teaching = 'Grades teaching is required';
    }

    if (!profile.subjects_teaching.trim()) {
      newErrors.subjects_teaching = 'Subjects teaching is required';
    }

    if (!profile.experience_years || profile.experience_years < 0) {
      (newErrors as any).experience_years = 'Experience years must be a positive number';
    }

    if (!profile.board.trim()) {
      newErrors.board = 'Board selection is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await apiService.createTeacherProfile(profile);
      await fetchProfile(); // Refresh profile context
      toast.success('Profile created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Profile creation failed:', error);
      const message = error.response?.data?.detail || 'Failed to create profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Tell us about your teaching background to get personalized assessments
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">
              Teacher Profile Setup
            </h2>
            <p className="text-gray-600">
              This information helps us generate relevant assessment questions for you
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                  Education Background
                </label>
                <textarea
                  id="education"
                  name="education"
                  value={profile.education}
                  onChange={handleInputChange}
                  placeholder="e.g., Masters in Computer Science, B.Ed in Mathematics"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  required
                />
                {errors.education && (
                  <p className="text-sm text-red-600 mt-1">{errors.education}</p>
                )}
              </div>

              <Input
                label="Grades Teaching"
                name="grades_teaching"
                value={profile.grades_teaching}
                onChange={handleInputChange}
                placeholder="e.g., 9-12, 6-8, Primary"
                error={errors.grades_teaching}
                required
              />

              <div>
                <label htmlFor="subjects_teaching" className="block text-sm font-medium text-gray-700">
                  Subjects Teaching
                </label>
                <textarea
                  id="subjects_teaching"
                  name="subjects_teaching"
                  value={profile.subjects_teaching}
                  onChange={handleInputChange}
                  placeholder="e.g., Mathematics, Computer Science, Physics"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  required
                />
                {errors.subjects_teaching && (
                  <p className="text-sm text-red-600 mt-1">{errors.subjects_teaching}</p>
                )}
              </div>

              <Input
                label="Years of Experience"
                name="experience_years"
                type="number"
                value={profile.experience_years.toString()}
                onChange={handleInputChange}
                placeholder="e.g., 5"
                error={(errors as any).experience_years}
                min="0"
                max="50"
                required
              />

              <div className="space-y-1">
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <select
                  id="state"
                  name="state"
                  value={profile.state}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {states.map(state => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="board" className="block text-sm font-medium text-gray-700">
                  Board/Curriculum
                </label>
                <select
                  id="board"
                  name="board"
                  value={profile.board}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {boards.map(board => (
                    <option key={board} value={board}>
                      {board}
                    </option>
                  ))}
                </select>
                {errors.board && (
                  <p className="text-sm text-red-600 mt-1">{errors.board}</p>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                  disabled={loading}
                >
                  Complete Profile Setup
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Why do we need this information?
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Generate relevant assessment questions for your subjects</li>
              <li>• Match questions to appropriate grade levels</li>
              <li>• Provide curriculum-aligned content (CBSE, ICSE, etc.)</li>
              <li>• Compare your performance with similar teachers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};