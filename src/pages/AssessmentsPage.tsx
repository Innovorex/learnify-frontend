import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Upload,
  CheckCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Module } from '@/types';
import apiService from '@/services/api';
import { toast } from 'sonner';

interface ModuleCardProps {
  module: Module;
  onStart: (module: Module) => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onStart }) => {
  const getIcon = (assessmentType: string) => {
    switch (assessmentType) {
      case 'mcq':
        return FileText;
      case 'submission':
        return Upload;
      case 'outcome':
        return CheckCircle;
      default:
        return BookOpen;
    }
  };

  const getTypeLabel = (assessmentType: string) => {
    switch (assessmentType) {
      case 'mcq':
        return 'Multiple Choice Questions';
      case 'submission':
        return 'File Submission';
      case 'outcome':
        return 'Outcome Assessment';
      default:
        return 'Assessment';
    }
  };

  const getTypeColor = (assessmentType: string) => {
    switch (assessmentType) {
      case 'mcq':
        return 'bg-blue-100 text-blue-800';
      case 'submission':
        return 'bg-green-100 text-green-800';
      case 'outcome':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const Icon = getIcon(module.assessment_type);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                {module.name}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {module.description}
              </p>
              <div className="flex items-center space-x-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                    module.assessment_type
                  )}`}
                >
                  {getTypeLabel(module.assessment_type)}
                </span>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  15-30 min
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={() => onStart(module)}
            size="sm"
            className="ml-4"
          >
            Start
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const AssessmentsPage: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await apiService.getModules();
        setModules(data);
      } catch (error) {
        console.error('Failed to fetch modules:', error);
        toast.error('Failed to load assessments');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const handleStartAssessment = (module: Module) => {
    if (module.assessment_type === 'mcq') {
      navigate(`/assessment/${module.id}`);
    } else if (module.assessment_type === 'submission') {
      navigate(`/submission/${module.id}`);
    } else {
      toast.info('This assessment type is coming soon!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const mcqModules = modules.filter(m => m.assessment_type === 'mcq');
  const submissionModules = modules.filter(m => m.assessment_type === 'submission');
  const outcomeModules = modules.filter(m => m.assessment_type === 'outcome');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Assessment Modules
        </h1>
        <p className="text-gray-600">
          Choose an assessment module to evaluate your teaching skills and track your professional development.
        </p>
      </div>

      {/* MCQ Assessments */}
      {mcqModules.length > 0 && (
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Multiple Choice Assessments
            </h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              AI-Generated Questions
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {mcqModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onStart={handleStartAssessment}
              />
            ))}
          </div>
        </div>
      )}

      {/* Submission Assessments */}
      {submissionModules.length > 0 && (
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <Upload className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Submission-Based Assessments
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {submissionModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onStart={handleStartAssessment}
              />
            ))}
          </div>
        </div>
      )}

      {/* Outcome Assessments */}
      {outcomeModules.length > 0 && (
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Outcome-Based Assessments
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {outcomeModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onStart={handleStartAssessment}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {modules.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No assessments available
          </h3>
          <p className="text-gray-600">
            Assessment modules will be available soon. Check back later!
          </p>
        </div>
      )}
    </div>
  );
};