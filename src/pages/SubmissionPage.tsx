import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, Loader2, BookOpen, Users, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Module } from '@/types';
import apiService from '@/services/api';
import { toast } from 'sonner';

export const SubmissionPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();

  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const modules = await apiService.getModules();
        const currentModule = modules.find(m => m.id === Number(moduleId));
        if (currentModule) {
          setModule(currentModule);
        } else {
          toast.error('Module not found');
          navigate('/assessments');
        }
      } catch (error) {
        console.error('Failed to fetch module:', error);
        toast.error('Failed to load module details');
        navigate('/assessments');
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId, navigate]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      await apiService.uploadFile(Number(moduleId), selectedFile, notes);
      toast.success('Submission uploaded successfully! Pending admin review.');
      navigate('/assessments');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload submission');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!module) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/assessments')}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assessments
        </Button>
      </div>

      {/* Module Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {module.name}
              </h1>
              <p className="text-gray-600 mb-4">
                {module.description}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Submission Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>Upload relevant documents (PDF, Word, Images, etc.)</li>
                      <li>Maximum file size: 10MB</li>
                      <li>Your submission will be reviewed by an admin</li>
                      <li>You'll receive a score once validated</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Categories Information */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            Submission Categories & NPST Domains
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Professional Growth & Collaboration */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    Professional Growth & Collaboration
                  </h3>
                  <p className="text-xs text-blue-800 font-medium mb-2">
                    NPST Domain 1 – Professional Knowledge & Practice
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-600 pl-11">
                <p className="font-medium mb-1">Examples:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Training certificates</li>
                  <li>Workshop attendance</li>
                  <li>CPD logs</li>
                </ul>
              </div>
            </div>

            {/* Community & Parent Engagement */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-start space-x-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    Community & Parent Engagement
                  </h3>
                  <p className="text-xs text-green-800 font-medium mb-2">
                    NPST Domain 4 – School–Community Partnership
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-600 pl-11">
                <p className="font-medium mb-1">Examples:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>PTA activities</li>
                  <li>Outreach programs</li>
                  <li>Community events</li>
                </ul>
              </div>
            </div>

            {/* Student Well-being & Holistic Development */}
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-start space-x-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Heart className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    Student Well-being & Holistic Development
                  </h3>
                  <p className="text-xs text-purple-800 font-medium mb-2">
                    NPST Domain 4 – Student Well-being & Inclusion
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-600 pl-11">
                <p className="font-medium mb-1">Examples:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Counselling activities</li>
                  <li>Life skills programs</li>
                  <li>SEWA initiatives</li>
                  <li>Inclusion activities</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Upload Your Submission
          </h2>

          {/* Drag and Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <FileText className="w-12 h-12 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">{selectedFile.name}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Remove File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium mb-1">
                    Drag and drop your file here
                  </p>
                  <p className="text-gray-500 text-sm">or</p>
                </div>
                <div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 px-3 py-1.5 text-sm cursor-pointer"
                  >
                    Browse Files
                  </label>
                </div>
                <p className="text-gray-400 text-xs">
                  Supported formats: PDF, Word, Images (Max 10MB)
                </p>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="mt-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any additional information about your submission..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigate('/assessments')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || uploading}
              className="flex items-center"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit for Review
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Info */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-900">
              <p className="font-medium mb-1">What happens next?</p>
              <p className="text-yellow-800">
                Once you submit your file, it will be reviewed by an administrator.
                You'll receive a score and feedback once the review is complete.
                You can check your submission status in the Progress section.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
