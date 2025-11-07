
import React from 'react';

export const Spinner: React.FC = () => (
  <div className="flex justify-center items-center p-4">
    <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
  </div>
);
