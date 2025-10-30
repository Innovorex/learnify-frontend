import React, { useState, useEffect } from 'react';
import {
  FileText,
  Loader2,
  Filter,
  Search,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { materialService } from '@/services/materialService';
import { TeachingMaterial, MaterialFilters } from '@/types/materials';
import { toast } from 'sonner';

interface MaterialListProps {
  onMaterialSelect?: (material: TeachingMaterial) => void;
  refreshTrigger?: number;
}

export const MaterialList: React.FC<MaterialListProps> = ({
  onMaterialSelect,
  refreshTrigger,
}) => {
  const [materials, setMaterials] = useState<TeachingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchMaterials();
  }, [page, subjectFilter, gradeFilter, statusFilter, refreshTrigger]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);

      const filters: MaterialFilters = {
        page,
        page_size: pageSize,
      };

      if (subjectFilter) filters.subject = subjectFilter;
      if (gradeFilter) filters.grade_level = gradeFilter;
      if (statusFilter) filters.status = statusFilter;

      const response = await materialService.listMaterials(filters);
      setMaterials(response.materials);
      setTotal(response.total);
    } catch (error: any) {
      console.error('Failed to fetch materials:', error);
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (materialId: number) => {
    if (!confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(materialId);
      await materialService.deleteMaterial(materialId);
      toast.success('Material deleted successfully');
      await fetchMaterials();
    } catch (error: any) {
      console.error('Failed to delete material:', error);
      toast.error('Failed to delete material');
    } finally {
      setDeleting(null);
    }
  };

  const handleClearFilters = () => {
    setSubjectFilter('');
    setGradeFilter('');
    setStatusFilter('');
    setSearchQuery('');
    setPage(1);
  };

  const filteredMaterials = materials.filter((material) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      material.title.toLowerCase().includes(query) ||
      material.original_filename.toLowerCase().includes(query) ||
      material.subject?.toLowerCase().includes(query) ||
      material.topics?.some((t) => t.toLowerCase().includes(query))
    );
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        {getStatusIcon(status)}
        <span className="ml-1.5 capitalize">{status}</span>
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading && materials.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading materials...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Teaching Materials</h3>
            <p className="text-sm text-gray-600">Manage your uploaded materials</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search materials..."
                className="pl-10"
              />
            </div>

            {showFilters && (
              <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <Input
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    placeholder="All subjects"
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Grade
                  </label>
                  <Input
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    placeholder="All grades"
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All statuses</option>
                    <option value="completed">Completed</option>
                    <option value="processing">Processing</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Materials List */}
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">No materials found</p>
              <p className="text-sm text-gray-500">
                {searchQuery || subjectFilter || gradeFilter || statusFilter
                  ? 'Try adjusting your filters'
                  : 'Upload your first material to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMaterials.map((material) => (
                <div
                  key={material.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 mb-1">{material.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{material.original_filename}</p>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          {material.subject && (
                            <span className="px-2 py-1 bg-gray-100 rounded">
                              {material.subject}
                            </span>
                          )}
                          {material.grade_level && (
                            <span className="px-2 py-1 bg-gray-100 rounded">
                              Grade {material.grade_level}
                            </span>
                          )}
                          <span>{formatFileSize(material.file_size)}</span>
                          <span>•</span>
                          <span>{formatDate(material.created_at)}</span>
                          {material.chunk_count > 0 && (
                            <>
                              <span>•</span>
                              <span>{material.chunk_count} chunks</span>
                            </>
                          )}
                        </div>

                        {material.topics && material.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {material.topics.map((topic, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {getStatusBadge(material.status)}

                      {material.status === 'completed' && onMaterialSelect && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMaterialSelect(material)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Use
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(material.id)}
                        disabled={deleting === material.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deleting === material.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {material.status === 'failed' && material.processing_error && (
                    <div className="mt-3 p-3 bg-red-50 rounded text-sm text-red-700">
                      <strong>Error:</strong> {material.processing_error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > pageSize && (
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-gray-600">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of{' '}
                {total} materials
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page * pageSize >= total}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
