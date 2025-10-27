import React, { useEffect, useState } from 'react';
import { Target, Lightbulb, ArrowRight, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GrowthPlan } from '@/types';
import apiService from '@/services/api';
import { toast } from 'sonner';

export const GrowthPlanPage: React.FC = () => {
  const [growthPlan, setGrowthPlan] = useState<GrowthPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchGrowthPlan();
  }, []);

  const fetchGrowthPlan = async () => {
    try {
      setLoading(true);
      const data = await apiService.generateGrowthPlan();
      setGrowthPlan(data);
    } catch (error: any) {
      console.error('Failed to fetch growth plan:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load growth plan');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateGrowthPlan = async () => {
    try {
      setGenerating(true);
      const data = await apiService.generateGrowthPlan();
      setGrowthPlan(data);
      toast.success('Growth plan updated successfully!');
    } catch (error) {
      console.error('Failed to regenerate growth plan:', error);
      toast.error('Failed to regenerate growth plan');
    } finally {
      setGenerating(false);
    }
  };

  const parseGrowthPlanContent = (content: string) => {
    // Simple markdown parsing for better display
    const lines = content.split('\n');
    const sections: { title: string; content: string[] }[] = [];
    let currentSection: { title: string; content: string[] } | null = null;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('##')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmedLine.replace('##', '').trim(),
          content: []
        };
      } else if (currentSection && trimmedLine) {
        currentSection.content.push(trimmedLine);
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized growth plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            AI-Powered Growth Plan
          </h1>
          <p className="text-gray-600">
            Personalized recommendations for your professional development journey.
          </p>
        </div>
        <Button
          onClick={handleRegenerateGrowthPlan}
          loading={generating}
          disabled={generating}
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerate Plan
        </Button>
      </div>

      {/* Growth Plan Content */}
      {growthPlan ? (
        <div className="space-y-6">
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Personalized Growth Plan
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">
                  AI-Generated Based on Your Performance Data
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Growth Plan Sections */}
          {parseGrowthPlanContent(growthPlan.content).map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {section.title}
                  </h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start space-x-3">
                      {item.startsWith('-') || item.startsWith('•') ? (
                        <>
                          <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700">
                            {item.replace(/^[-•]\s*/, '')}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-700">{item}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Action Items Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Next Steps</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Review Your Growth Plan</p>
                    <p className="text-gray-600">Take time to understand each recommendation and how it applies to your teaching context.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Set Implementation Goals</p>
                    <p className="text-gray-600">Choose 2-3 key areas to focus on initially and create specific, measurable goals.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Track Your Progress</p>
                    <p className="text-gray-600">Regular assessments will help monitor your improvement and update your growth plan.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* No Growth Plan Available */
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Growth Plan Not Available
            </h3>
            <p className="text-gray-600 mb-6">
              Complete some assessments to generate your personalized AI-powered growth plan.
            </p>
            <Button onClick={handleRegenerateGrowthPlan} loading={generating}>
              <Lightbulb className="w-4 h-4 mr-2" />
              Generate Growth Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Pro Tips</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-gray-700">
                Your growth plan is automatically updated based on your latest assessment results.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-gray-700">
                Focus on 2-3 key areas at a time for maximum impact on your professional development.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-gray-700">
                Regular practice and reflection on the recommended strategies will accelerate your growth.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};