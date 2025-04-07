
import React from 'react';

interface AuthContainerProps {
  children: React.ReactNode;
}

export const AuthContainer = ({ children }: AuthContainerProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {children}
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            dScrt - Mensajería segura y privada
          </p>
        </div>
      </div>
    </div>
  );
};
