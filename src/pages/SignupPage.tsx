import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { SignupCredentials } from '@/types';

export const SignupPage: React.FC = () => {
  const [credentials, setCredentials] = useState<SignupCredentials>({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'teacher',
  });
  const [errors, setErrors] = useState<Partial<SignupCredentials>>({});
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof SignupCredentials]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SignupCredentials> = {};

    if (!credentials.name) {
      newErrors.name = 'Name is required';
    } else if (credentials.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Validate student-specific fields
    if (credentials.role === 'student') {
      if (!credentials.class_name) {
        newErrors.class_name = 'Class is required for students';
      }
      if (!credentials.section) {
        newErrors.section = 'Section is required for students';
      }
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!credentials.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (credentials.password !== credentials.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await signup(credentials);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by AuthContext
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Teacher Evaluation Platform
          </h1>
          <p className="text-gray-600">
            Empowering educators through comprehensive assessment and growth
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">
              Create your account
            </h2>
            <p className="text-gray-600">
              Join thousands of teachers on their professional development journey
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                name="name"
                value={credentials.name}
                onChange={handleInputChange}
                error={errors.name}
                placeholder="Enter your full name"
                required
              />

              <Input
                label="Email address"
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleInputChange}
                error={errors.email}
                placeholder="Enter your email"
                required
              />

              <div className="space-y-1">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={credentials.role}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {/* Student-specific fields */}
              {credentials.role === 'student' && (
                <>
                  <div className="space-y-1">
                    <label htmlFor="class_name" className="block text-sm font-medium text-gray-700">
                      Class
                    </label>
                    <select
                      id="class_name"
                      name="class_name"
                      value={credentials.class_name || ''}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Class</option>
                      {[6, 7, 8, 9, 10, 11, 12].map((cls) => (
                        <option key={cls} value={cls.toString()}>
                          Class {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Section"
                    type="text"
                    name="section"
                    value={credentials.section || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your section (e.g., A, B, C)"
                    required
                  />
                </>
              )}

              <Input
                label="Password"
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                error={errors.password}
                placeholder="Enter your password"
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirm_password"
                value={credentials.confirm_password}
                onChange={handleInputChange}
                error={errors.confirm_password}
                placeholder="Confirm your password"
                required
              />

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};