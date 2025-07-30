import React from 'react';
import { motion } from 'framer-motion';

interface OccupancyIndicatorProps {
  current: number;
  capacity: number;
  showPercentage?: boolean;
  showBar?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const OccupancyIndicator: React.FC<OccupancyIndicatorProps> = ({
  current,
  capacity,
  showPercentage = true,
  showBar = true,
  size = 'md',
  className = '',
}) => {
  const percentage = Math.round((current / capacity) * 100);
  
  const getOccupancyLevel = (percent: number) => {
    if (percent <= 30) return { level: 'low', color: 'success', bgColor: 'bg-success-100', textColor: 'text-success-800' };
    if (percent <= 70) return { level: 'medium', color: 'warning', bgColor: 'bg-warning-100', textColor: 'text-warning-800' };
    return { level: 'high', color: 'danger', bgColor: 'bg-danger-100', textColor: 'text-danger-800' };
  };

  const occupancyLevel = getOccupancyLevel(percentage);

  const sizes = {
    sm: {
      container: 'text-xs',
      bar: 'h-1',
      percentage: 'text-xs',
    },
    md: {
      container: 'text-sm',
      bar: 'h-2',
      percentage: 'text-sm',
    },
    lg: {
      container: 'text-base',
      bar: 'h-3',
      percentage: 'text-base',
    },
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex flex-col space-y-1 ${currentSize.container} ${className}`}>
      <div className="flex items-center justify-between">
        <span className="font-medium">
          {current}/{capacity}
        </span>
        {showPercentage && (
          <span className={`font-semibold ${occupancyLevel.textColor}`}>
            {percentage}%
          </span>
        )}
      </div>
      
      {showBar && (
        <div className="w-full bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`${currentSize.bar} rounded-full transition-all duration-300 ${
              occupancyLevel.color === 'success' ? 'bg-success-500' :
              occupancyLevel.color === 'warning' ? 'bg-warning-500' :
              'bg-danger-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}
      
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${occupancyLevel.bgColor} ${occupancyLevel.textColor}`}>
        {occupancyLevel.level === 'low' && 'Low Occupancy'}
        {occupancyLevel.level === 'medium' && 'Medium Occupancy'}
        {occupancyLevel.level === 'high' && 'High Occupancy'}
      </div>
    </div>
  );
};

export default OccupancyIndicator; 