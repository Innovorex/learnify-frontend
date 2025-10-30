import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { materialService } from '@/services/materialService';
import { MaterialUploadResponse, FileProcessingStatus } from '@/types/materials';
import { toast } from 'sonner';

interface MaterialUploadProps {
  onUploadSuccess?: (materialId: number) => void;
}

export const MaterialUpload: React.FC<MaterialUploadProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadResponse, setUploadResponse] = useState<MaterialUploadResponse | null>(null);
  const [processingStatus, setProcessingStatus] = useState<FileProcessingStatus | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [topics, setTopics] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['.pdf', '.docx', '.txt'];
  const maxSizeMB = 50;

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      toast.error(`Invalid file type. Please upload ${allowedTypes.join(', ')} files.`);
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast.error(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    setSelectedFile(file);

    // Auto-populate title from filename if empty
    if (!title) {
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      setTitle(fileName);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title for the material.');
      return;
    }

    try {
      setUploading(true);

      const response = await materialService.uploadMaterial({
        file: selectedFile,
        title: title.trim(),
        description: description.trim() || undefined,
        subject: subject.trim() || undefined,
        grade_level: gradeLevel.trim() || undefined,
        topics: topics.trim() || undefined,
      });

      setUploadResponse(response);
      toast.success('File uploaded successfully! Processing in background...');

      // Start polling for processing status
      setProcessing(true);
      await materialService.pollProcessingStatus(
        response.material_id,
        (status) => {
          setProcessingStatus(status);
        }
      );

      toast.success('Material processed successfully!');
      setProcessing(false);

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(response.material_id);
      }

      // Reset form
      resetForm();
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload material.');
      setUploading(false);
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setTitle('');
    setDescription('');
    setSubject('');
    setGradeLevel('');
    setTopics('');
    setUploadResponse(null);
    setProcessingStatus(null);
    setUploading(false);
    setProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Upload Teaching Material</h3>
        <p className="text-sm text-gray-600">Upload PDF, DOCX, or TXT files for AI-powered teaching assistance</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : selectedFile
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {!selectedFile ? (
              <>
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">Drag and drop your file here, or</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  disabled={uploading || processing}
                >
                  Browse Files
                </Button>
                <p className="text-xs text-gray-500 mt-4">
                  Supported formats: PDF, DOCX, TXT (max {maxSizeMB}MB)
                </p>
              </>
            ) : (
              <div className="flex items-center justify-between bg-white rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                {!uploading && !processing && (
                  <button
                    onClick={handleRemoveFile}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Form Fields */}
          {selectedFile && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Chapter 1: Real Numbers"
                  disabled={uploading || processing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the material..."
                  rows={3}
                  disabled={uploading || processing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Mathematics"
                    disabled={uploading || processing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade Level
                  </label>
                  <Input
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    placeholder="e.g., 10"
                    disabled={uploading || processing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topics (comma-separated)
                </label>
                <Input
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  placeholder="e.g., rational numbers, irrational numbers"
                  disabled={uploading || processing}
                />
              </div>
            </div>
          )}

          {/* Processing Status */}
          {(uploading || processing) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">
                    {uploading ? 'Uploading file...' : 'Processing material...'}
                  </p>
                  {processingStatus && (
                    <>
                      <p className="text-sm text-blue-700 mt-1">{processingStatus.message}</p>
                      <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${processingStatus.progress}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Success Status */}
          {uploadResponse && !processing && processingStatus?.status === 'completed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-900">Material uploaded successfully!</p>
                  <p className="text-sm text-green-700">You can now use this material with AI Tutor.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Status */}
          {processingStatus?.status === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-900">Processing failed</p>
                  <p className="text-sm text-red-700">{processingStatus.error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !title.trim() || uploading || processing}
            className="w-full"
          >
            {uploading || processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploading ? 'Uploading...' : 'Processing...'}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Material
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
