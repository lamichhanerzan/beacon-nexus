import React from 'react';

interface GatedQuestionProps {
  show: boolean;
  children: React.ReactNode;
}

export const GatedQuestion: React.FC<GatedQuestionProps> = ({ show, children }) => {
  if (!show) return null;
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{ animationFillMode: 'backwards' }}
    >
      {children}
    </div>
  );
};
