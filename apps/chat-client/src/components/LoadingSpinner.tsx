import React from 'react';

interface LoadingSpinnerProps {
  isLoading: boolean;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ isLoading, size = 'md', message }) => {
  if (!isLoading) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
      <div
        className={`animate-spin rounded-full border-t-transparent border-solid border-blue-500 ${sizeClasses[size]}`}
      ></div>
      {message && <p className="mt-3 text-white">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
