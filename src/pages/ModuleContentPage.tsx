import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  PlayCircle,
  FileText,
  Video,
  Loader2,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import apiService from '@/services/api';
import { ModuleContent, ModuleTopic } from '@/types';
import { toast } from 'sonner';

export const ModuleContentPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [moduleContent, setModuleContent] = useState<ModuleContent | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<ModuleTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (moduleId) {
      fetchModuleContent();
    }
  }, [moduleId]);

  const fetchModuleContent = async () => {
    try {
      setLoading(true);
      const data = await apiService.getModuleContent(parseInt(moduleId!));
      setModuleContent(data);

      // Select first topic by default
      if (data.topics.length > 0) {
        setSelectedTopic(data.topics[0]);
      }
    } catch (error: any) {
      console.error('Failed to fetch module content:', error);
      toast.error('Failed to load module content');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (topicId: number) => {
    try {
      setMarkingComplete(true);
      const response = await apiService.markTopicComplete(topicId);
      toast.success(`Topic marked complete! Module progress: ${Math.round(response.module_progress_percentage)}%`);

      // Refresh data
      await fetchModuleContent();
    } catch (error: any) {
      console.error('Failed to mark topic complete:', error);
      if (error.response?.data?.detail?.includes('already completed')) {
        toast.info('Topic already marked as complete');
      } else {
        toast.error('Failed to mark topic complete');
      }
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleStartExam = () => {
    if (!moduleContent) return;

    const allTopicsCompleted = moduleContent.topics.every((t) => t.completed);
    if (!allTopicsCompleted) {
      toast.warning('Complete all topics before starting the exam');
      return;
    }

    navigate(`/career-progression/module/${moduleId}/exam`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!moduleContent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Module not found</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const allTopicsCompleted = moduleContent.topics.every((t) => t.completed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>

        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">{moduleContent.module.module_name}</h1>
          <p className="text-blue-100">
            Module {moduleContent.module.module_number}
          </p>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">
                {moduleContent.progress.completed_topics} / {moduleContent.progress.total_topics} topics
              </span>
            </div>
            <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${moduleContent.progress.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topics Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Topics</h3>
              <p className="text-sm text-gray-600">
                {moduleContent.progress.completed_topics} of {moduleContent.progress.total_topics} completed
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {moduleContent.topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedTopic?.id === topic.id
                        ? 'bg-blue-50 border-2 border-blue-300'
                        : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {topic.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900">
                          {topic.topic_number}. {topic.topic_name}
                        </p>
                        {topic.video_duration && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <Video className="w-3 h-3 mr-1" />
                            {topic.video_duration}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Exam Button */}
              <div className="mt-6 pt-6 border-t">
                <Button
                  onClick={handleStartExam}
                  disabled={!allTopicsCompleted}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                >
                  {allTopicsCompleted ? (
                    <>
                      <Award className="w-4 h-4 mr-2" />
                      Start Module Exam
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 mr-2" />
                      Complete All Topics First
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2">
          {selectedTopic ? (
            <div className="space-y-6">
              {/* Topic Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedTopic.topic_number}. {selectedTopic.topic_name}
                      </h2>
                      {selectedTopic.completed && (
                        <div className="flex items-center text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Completed
                        </div>
                      )}
                    </div>
                    {!selectedTopic.completed && (
                      <Button
                        onClick={() => handleMarkComplete(selectedTopic.id)}
                        disabled={markingComplete}
                        variant="outline"
                      >
                        {markingComplete ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Marking...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Complete
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Video Lecture */}
              <Card className="border-2 border-blue-300 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                      <PlayCircle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Watch Video Lecture</h3>
                      <p className="text-sm text-gray-600 mt-0.5">
                        Main learning resource{selectedTopic.video_duration && ` • ${selectedTopic.video_duration}`}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {selectedTopic.video_url ? (
                    <div className="aspect-video w-full bg-black">
                      <iframe
                        key={`${selectedTopic.id}-${selectedTopic.video_url}`}
                        src={`${selectedTopic.video_url}?autoplay=0&rel=0&modestbranding=1`}
                        className="w-full h-full"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        title={selectedTopic.topic_name}
                        frameBorder="0"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Video className="w-10 h-10 text-gray-500" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">Video Coming Soon</h4>
                        <p className="text-sm text-gray-600 max-w-md mx-auto">
                          Educational video for this topic will be uploaded soon.
                          Please refer to the study notes below for now.
                        </p>
                        <div className="mt-4 text-xs text-gray-500">
                          📚 For official IGNOU videos, visit: <br />
                          <span className="font-mono">YouTube @egyankoshIGNOU</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Study Notes - Enhanced */}
              {selectedTopic.content_text && (
                <Card className="border border-gray-200">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-slate-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">📚 Study Notes & Key Points</h3>
                        <p className="text-sm text-gray-600">Supplementary reference material</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="prose prose-lg max-w-none">
                      <div
                        className="text-gray-800 leading-[1.8] whitespace-pre-wrap [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:ml-6 [&>ul]:list-disc [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mt-6 [&>h3]:mb-3 [&>strong]:text-blue-700 [&>strong]:font-semibold"
                        style={{ fontSize: '16px', lineHeight: '1.8' }}
                        dangerouslySetInnerHTML={{ __html: selectedTopic.content_text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mark Complete Button (Bottom) */}
              {!selectedTopic.completed && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700">
                        Finished studying this topic?
                      </p>
                      <Button
                        onClick={() => handleMarkComplete(selectedTopic.id)}
                        disabled={markingComplete}
                      >
                        {markingComplete ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Marking Complete...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Complete
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-600">Select a topic to view content</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
