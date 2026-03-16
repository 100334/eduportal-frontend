import React from 'react';

export default function LoadingSpinner({ fullScreen = true }) {
  const spinner = (
    <div className="flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-border border-t-gold rounded-full animate-spin"></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        {spinner}
      </div>
    );
  }

  return spinner;
}