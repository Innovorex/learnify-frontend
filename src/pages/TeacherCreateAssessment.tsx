import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Calendar, Clock, BookOpen, Sparkles, ArrowLeft, FileText } from 'lucide-react';
import k12Api from '../services/k12Api';
import { materialService } from '../services/materialService';
import type { CreateAssessmentRequest } from '../types/k12';
import type { TeachingMaterial } from '../types/materials';

export const TeacherCreateAssessment: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<CreateAssessmentRequest>({
    teacher_id: user?.id || 0,
    class_name: '9',
    section: 'A',
    subject: 'Mathematics',
    chapter: '',
    start_time: '',
    end_time: '',
    duration_minutes: 60,
  });

  // Material-based question generation
  const [useUploadedMaterial, setUseUploadedMaterial] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [fromPage, setFromPage] = useState<number>(1);
  const [toPage, setToPage] = useState<number>(10);
  const [availableMaterials, setAvailableMaterials] = useState<TeachingMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  const subjects = [
    'Mathematics',
    'Science',
    'English',
    'Hindi',
    'Social Science',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
  ];

  const classes = ['6', '7', '8', '9', '10', '11', '12'];

  // Load materials when checkbox is checked
  useEffect(() => {
    if (useUploadedMaterial) {
      loadAvailableMaterials();
    }
  }, [useUploadedMaterial]);

  const loadAvailableMaterials = async () => {
    try {
      setLoadingMaterials(true);
      const response = await materialService.listMaterials({
        status: 'completed',
        page: 1,
        page_size: 100,
      });
      setAvailableMaterials(response.materials);
    } catch (error) {
      console.error('Failed to load materials:', error);
      toast.error('Failed to load materials');
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'duration_minutes'
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (useUploadedMaterial) {
      if (!selectedMaterialId) {
        toast.error('Please select a material');
        return;
      }
      // Optional validation: only check if user provided values
      if (fromPage && toPage) {
        if (fromPage < 1) {
          toast.error('From page must be at least 1');
          return;
        }
        if (toPage < fromPage) {
          toast.error('To page must be greater than or equal to From page');
          return;
        }
        if (toPage - fromPage > 50) {
          toast.error('Page range cannot exceed 50 pages');
          return;
        }
      }
    } else {
      if (!formData.chapter.trim()) {
        toast.error('Please enter a chapter name');
        return;
      }
    }

    if (!formData.start_time || !formData.end_time) {
      toast.error('Please select start and end times');
      return;
    }

    const startTime = new Date(formData.start_time);
    const endTime = new Date(formData.end_time);

    if (endTime <= startTime) {
      toast.error('End time must be after start time');
      return;
    }

    if (formData.duration_minutes < 15 || formData.duration_minutes > 180) {
      toast.error('Duration must be between 15 and 180 minutes');
      return;
    }

    try {
      setCreating(true);

      await k12Api.createAssessment({
        ...formData,
        use_material: useUploadedMaterial,
        material_id: useUploadedMaterial ? selectedMaterialId! : undefined,
        from_page: useUploadedMaterial ? (fromPage || 1) : undefined,
        to_page: useUploadedMaterial ? (toPage || 10) : undefined,
      });

      toast.success(
        'Assessment created successfully! AI is generating questions...'
      );
      toast.info('Questions will be ready in ~15 seconds');

      // Navigate to assessment list
      setTimeout(() => {
        navigate('/teacher/k12/assessments');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating assessment:', error);
      toast.error(
        error.response?.data?.detail ||
          'Failed to create assessment. Please try again.'
      );
    } finally {
      setCreating(false);
    }
  };

  // Calculate suggested end time based on start time and duration
  const updateEndTime = (startTime: string, duration: number) => {
    if (!startTime) return;

    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);

    // Format as datetime-local
    const endTimeStr = end.toISOString().slice(0, 16);
    setFormData((prev) => ({ ...prev, end_time: endTimeStr }));
  };

  React.useEffect(() => {
    if (formData.start_time && formData.duration_minutes) {
      updateEndTime(formData.start_time, formData.duration_minutes);
    }
  }, [formData.start_time, formData.duration_minutes]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/teacher/k12/assessments')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessments
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-600" />
            Create Student Assessment
          </h1>
          <p className="text-gray-600 mt-2">
            AI will automatically generate 10 questions based on CBSE syllabus
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg">
          <div className="p-8 space-y-6">
            {/* Class and Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class <span className="text-red-500">*</span>
                </label>
                <select
                  name="class_name"
                  value={formData.class_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  required
                  maxLength={5}
                  placeholder="A, B, C..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-1" />
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter / Topic {!useUploadedMaterial && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="chapter"
                value={formData.chapter}
                onChange={handleChange}
                required={!useUploadedMaterial}
                disabled={useUploadedMaterial}
                placeholder={useUploadedMaterial ? "Will use material content" : "e.g., Real Numbers, Acids and Bases"}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  useUploadedMaterial ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300'
                }`}
              />
              {!useUploadedMaterial && (
                <p className="text-xs text-gray-500 mt-1">
                  AI will use CBSE syllabus content for this chapter
                </p>
              )}
            </div>

            {/* Material Selection Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="use_material"
                  checked={useUploadedMaterial}
                  onChange={(e) => {
                    setUseUploadedMaterial(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedMaterialId(null);
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="use_material" className="ml-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Use my uploaded material for question generation
                </label>
              </div>

              {useUploadedMaterial && (
                <div className="ml-6 space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  {/* Material Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Material <span className="text-red-500">*</span>
                    </label>
                    {loadingMaterials ? (
                      <div className="text-sm text-gray-500">Loading materials...</div>
                    ) : availableMaterials.length === 0 ? (
                      <div className="text-sm text-gray-500">
                        No materials available. Please upload materials first.
                      </div>
                    ) : (
                      <select
                        value={selectedMaterialId || ''}
                        onChange={(e) => setSelectedMaterialId(Number(e.target.value))}
                        required={useUploadedMaterial}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">-- Select a material --</option>
                        {availableMaterials.map((material) => (
                          <option key={material.id} value={material.id}>
                            {material.title} ({material.original_filename})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Page Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Page <span className="text-gray-400 text-xs">(optional)</span>
                      </label>
                      <input
                        type="number"
                        value={fromPage}
                        onChange={(e) => setFromPage(Number(e.target.value))}
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1 (default)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To Page <span className="text-gray-400 text-xs">(optional)</span>
                      </label>
                      <input
                        type="number"
                        value={toPage}
                        onChange={(e) => setToPage(Number(e.target.value))}
                        min={fromPage}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="10 (default)"
                      />
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 bg-white p-3 rounded border border-blue-200">
                    📘 Questions will be generated from pages {fromPage} to {toPage} of the selected material
                    {toPage - fromPage > 50 && (
                      <span className="text-red-600 block mt-1">⚠️ Page range exceeds 50 pages limit</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Start Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  End Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {[30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        duration_minutes: mins,
                      }))
                    }
                    className={`px-4 py-2 rounded-lg border ${
                      formData.duration_minutes === mins
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleChange}
                  required
                  min="15"
                  max="180"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Between 15 and 180 minutes
              </p>
            </div>

            {/* AI Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">AI Question Generation</p>
                  <ul className="space-y-1 text-blue-800">
                    <li>• 10 questions will be generated automatically</li>
                    <li>• Based on CBSE syllabus for the selected chapter</li>
                    <li>• Mix of easy, medium, and hard difficulty</li>
                    <li>• Generation takes ~15 seconds</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 rounded-b-lg flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/teacher/k12/assessments')}
              className="px-6 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Assessment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
