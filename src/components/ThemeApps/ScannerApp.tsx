
import React from 'react';
import GenericAppTemplate from './GenericAppTemplate';

interface ScannerAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
}

const ScannerApp: React.FC<ScannerAppProps> = ({ onSettingsClick, hasUnreadMessages = false }) => {
  return (
    <GenericAppTemplate
      title="Scanner"
      icon="📄"
      color="bg-gradient-to-b from-gray-400 to-gray-600 text-white"
      onSettingsClick={onSettingsClick}
      hasUnreadMessages={hasUnreadMessages}
    />
  );
};

export default ScannerApp;
