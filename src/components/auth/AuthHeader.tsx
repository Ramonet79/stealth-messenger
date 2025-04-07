
import React from 'react';

export const AuthHeader = ({ title }: { title: string }) => {
  return (
    <>
      <div className="flex justify-center mb-6">
        <img 
          src="/lovable-uploads/3f963389-b035-45c6-890b-824df3549300.png" 
          alt="dScrt Logo" 
          className="h-20 w-20 rounded-lg" 
        />
      </div>
      <h1 className="text-2xl font-bold mb-6 text-center">
        {title}
      </h1>
    </>
  );
};
