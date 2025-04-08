
import React from 'react';
import { Alert, AlertDescription } from "./alert";
import { X } from 'lucide-react';

interface AlertWithCloseProps {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}

export const AlertWithClose: React.FC<AlertWithCloseProps> = ({ 
  children, 
  onClose,
  className = ""
}) => {
  return (
    <Alert className={`shadow-lg ${className}`}>
      <AlertDescription className="flex justify-between items-center">
        <span>{children}</span>
        <button 
          onClick={onClose}
          className="ml-2 text-sm font-medium underline flex items-center"
          aria-label="Cerrar"
        >
          <X size={16} className="mr-1" /> Cerrar
        </button>
      </AlertDescription>
    </Alert>
  );
};
