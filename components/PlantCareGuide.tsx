
import React from 'react';
import { PlantInfo } from '../types';
import { SunIcon, WaterDropIcon, SoilIcon, FertilizerIcon, PruningIcon, FunFactIcon } from './icons';

interface PlantCareGuideProps {
  info: PlantInfo;
}

export const PlantCareGuide: React.FC<PlantCareGuideProps> = ({ info }) => {
  const careItems = [
    { icon: <WaterDropIcon />, label: 'Watering', value: info.careInstructions.watering },
    { icon: <SunIcon />, label: 'Sunlight', value: info.careInstructions.sunlight },
    { icon: <SoilIcon />, label: 'Soil', value: info.careInstructions.soil },
    { icon: <FertilizerIcon />, label: 'Fertilizer', value: info.careInstructions.fertilizer },
    { icon: <PruningIcon />, label: 'Pruning', value: info.careInstructions.pruning },
  ];

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200/50 animate-fade-in">
      <h2 className="text-3xl font-bold text-green-800 mb-2">{info.plantName}</h2>
      <p className="text-gray-600 mb-6 italic">{info.description}</p>

      <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-4">
        <FunFactIcon className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-emerald-800">Fun Fact</h4>
          <p className="text-emerald-700">{info.funFact}</p>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-green-700 mb-4 border-b pb-2">Care Instructions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {careItems.map(item => (
          <div key={item.label} className="flex items-start gap-4">
            <div className="flex-shrink-0 text-green-600 bg-green-100 p-2 rounded-full">
              {item.icon}
            </div>
            <div>
              <h4 className="font-bold text-gray-700">{item.label}</h4>
              <p className="text-gray-600 text-sm">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
