
import React from 'react';
import GenericAppTemplate from './GenericAppTemplate';

interface ScannerAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
  logoAura?: 'none' | 'green' | 'red';
}

const ScannerApp: React.FC<ScannerAppProps> = ({ onSettingsClick, hasUnreadMessages = false, logoAura = 'none' }) => {
  return (
    <GenericAppTemplate
      title="Escáner"
      icon="📷"
      color="bg-gradient-to-b from-red-400 to-red-600 text-white"
      onSettingsClick={onSettingsClick}
      hasUnreadMessages={hasUnreadMessages}
      logoAura={logoAura}
    />
  );
};

export default ScannerApp;
