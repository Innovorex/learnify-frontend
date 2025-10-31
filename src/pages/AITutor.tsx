import React, { useState, useEffect, useRef } from 'react';
import { aiTutorService } from '../services/aiTutor';
import { materialService } from '../services/materialService';
import apiService from '../services/api';
import type { Message, SessionHistory } from '../types/aiTutor';
import type { TeachingMaterial } from '../types/materials';
import { Sparkles, Send, GraduationCap, Loader2, Plus, History, X, FileText } from 'lucide-react';

const AITutor: React.FC = () => {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);

  const [topicName, setTopicName] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [grade, setGrade] = useState('10');
  const [state, setState] = useState('Telangana');
  const [board, setBoard] = useState('CBSE'); // Will be loaded from teacher profile

  // Material selection
  const [useUploadedMaterial, setUseUploadedMaterial] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [availableMaterials, setAvailableMaterials] = useState<TeachingMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadSessionHistory();
    loadTeacherProfile();
  }, []);

  useEffect(() => {
    if (useUploadedMaterial) {
      loadAvailableMaterials();
    }
  }, [useUploadedMaterial]);

  const loadTeacherProfile = async () => {
    try {
      const profile = await apiService.getTeacherProfile();
      if (profile.board) {
        setBoard(profile.board);
      }
      if (profile.state) {
        setState(profile.state);
      }
      if (profile.subjects_teaching && profile.subjects_teaching.length > 0) {
        setSubject(profile.subjects_teaching[0]); // Set first subject as default
      }
      if (profile.grades_teaching && profile.grades_teaching.length > 0) {
        setGrade(profile.grades_teaching[0]); // Set first grade as default
      }
    } catch (error) {
      console.error('Failed to load teacher profile:', error);
      // Keep defaults if profile load fails
    }
  };

  const loadSessionHistory = async () => {
    try {
      const history = await aiTutorService.getSessions();
      setSessionHistory(history);
    } catch (error) {
      console.error('Failed to load session history:', error);
    }
  };

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
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();

    // Topic name is only required when NOT using uploaded material
    if (!useUploadedMaterial && !topicName.trim()) {
      alert('Please enter a topic name');
      return;
    }

    if (useUploadedMaterial && !selectedMaterialId) {
      alert('Please select a material to use');
      return;
    }

    setIsLoading(true);
    try {
      const response = await aiTutorService.startSession({
        topic_name: topicName || '',  // Send empty string if no topic (backend will use material title)
        subject,
        grade,
        state,
        board,
        use_uploaded_material: useUploadedMaterial,
        material_id: useUploadedMaterial ? selectedMaterialId! : undefined,
      });

      setSessionId(response.session_id);
      setMessages([
        {
          role: 'assistant',
          content: response.initial_message,
          timestamp: response.created_at,
          model: response.model_used,
        },
      ]);
      setShowNewSessionForm(false);
      loadSessionHistory();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !sessionId || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiTutorService.chat({
        session_id: sessionId,
        message: inputMessage,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp,
        model: response.model_used,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = async (session: SessionHistory) => {
    setIsLoading(true);
    try {
      const response = await aiTutorService.getSessionMessages(session.session_id);
      setSessionId(session.session_id);
      setMessages(response.messages);
      setShowHistory(false);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to load session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = () => {
    setShowNewSessionForm(true);
    setSessionId(null);
    setMessages([]);
    setTopicName('');
    setUseUploadedMaterial(false);
    setSelectedMaterialId(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Tutor</h1>
              <p className="text-purple-100 text-sm">Your Personal Teaching Assistant</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              <History className="w-4 h-4" />
              History
            </button>
            <button
              onClick={handleNewSession}
              className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition"
            >
              <Plus className="w-4 h-4" />
              New Session
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && !showNewSessionForm && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="bg-gradient-to-br from-purple-100 to-indigo-100 p-6 rounded-full inline-block mb-4">
                    <GraduationCap className="w-16 h-16 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to AI Tutor!</h2>
                  <p className="text-gray-600 mb-6">
                    Get personalized teaching guidance powered by IGNOU B.Ed pedagogy and Claude AI.
                  </p>
                  <button
                    onClick={handleNewSession}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Start Your First Session
                  </button>
                </div>
              </div>
            )}

            {showNewSessionForm && (
              <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Start New AI Tutor Session</h3>
                  <button onClick={() => setShowNewSessionForm(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleStartSession} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic Name {!useUploadedMaterial && <span className="text-red-500">*</span>}
                      {useUploadedMaterial && <span className="text-gray-500 text-xs">(optional)</span>}
                    </label>
                    <input
                      type="text"
                      value={topicName}
                      onChange={(e) => setTopicName(e.target.value)}
                      placeholder={useUploadedMaterial ? "Optional - or leave blank to use material title" : "e.g., Quadratic Equations, Photosynthesis"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required={!useUploadedMaterial}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option>Mathematics</option>
                        <option>Science</option>
                        <option>Social Science</option>
                        <option>English</option>
                        <option>Hindi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {[6, 7, 8, 9, 10].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Material Selection */}
                  <div className="border-t pt-4">
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        id="use-material"
                        checked={useUploadedMaterial}
                        onChange={(e) => setUseUploadedMaterial(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="use-material" className="ml-2 text-sm font-medium text-gray-700">
                        Use my uploaded material
                      </label>
                      <FileText className="w-4 h-4 ml-2 text-purple-600" />
                    </div>

                    {useUploadedMaterial && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Material *
                        </label>
                        {loadingMaterials ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                            <span className="ml-2 text-gray-600">Loading materials...</span>
                          </div>
                        ) : availableMaterials.length === 0 ? (
                          <div className="text-center py-4 px-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">No materials available</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Upload materials from the Materials page first
                            </p>
                          </div>
                        ) : (
                          <select
                            value={selectedMaterialId || ''}
                            onChange={(e) => setSelectedMaterialId(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required={useUploadedMaterial}
                          >
                            <option value="">Select a material...</option>
                            {availableMaterials.map((material) => (
                              <option key={material.id} value={material.id}>
                                {material.title} ({material.subject} - Grade {material.grade_level})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || (useUploadedMaterial && !selectedMaterialId)}
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Starting Session...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Start AI Tutor Session
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl ${message.role === 'user' ? 'bg-purple-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm shadow-md'} p-4`}>
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 text-purple-600 font-medium mb-2 text-sm">
                      <Sparkles className="w-4 h-4" />
                      AI Tutor
                    </div>
                  )}
                  <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-purple-200' : 'text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-sm shadow-md p-4 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                  <span className="text-gray-600">AI is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {sessionId && (
            <div className="border-t bg-white p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask a follow-up question..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </form>
            </div>
          )}
        </div>


        {showHistory && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Session History</h3>
                <button onClick={() => setShowHistory(false)}>
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-2">
              {sessionHistory.map((session) => (
                <button
                  key={session.session_id}
                  onClick={() => loadSession(session)}
                  className="w-full text-left p-3 rounded-lg hover:bg-purple-50 border border-gray-200 hover:border-purple-300 transition"
                >
                  <div className="font-medium text-gray-800 mb-1">{session.topic_name}</div>
                  <div className="text-xs text-gray-600">{session.subject} • Grade {session.grade}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {session.message_count} messages • {new Date(session.last_activity).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITutor;
