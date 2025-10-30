import React, { useState } from 'react';
import { MaterialUpload } from '@/components/Materials/MaterialUpload';
import { MaterialList } from '@/components/Materials/MaterialList';
import { TeachingMaterial } from '@/types/materials';

export const Materials: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = (materialId: number) => {
    // Refresh the materials list
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleMaterialSelect = (material: TeachingMaterial) => {
    // Could navigate to AI Tutor with this material
    console.log('Selected material:', material);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teaching Materials</h1>
        <p className="text-gray-600 mt-1">
          Upload and manage your teaching materials for AI-powered assistance
        </p>
      </div>

      <MaterialUpload onUploadSuccess={handleUploadSuccess} />
      <MaterialList
        onMaterialSelect={handleMaterialSelect}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};

export default Materials;
