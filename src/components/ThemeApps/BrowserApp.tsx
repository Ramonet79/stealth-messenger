
import React from 'react';
import GenericAppTemplate from './GenericAppTemplate';

interface BrowserAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
  logoAura?: 'none' | 'green' | 'red';
}

const BrowserApp: React.FC<BrowserAppProps> = ({ onSettingsClick, hasUnreadMessages = false, logoAura = 'none' }) => {
  return (
    <GenericAppTemplate
      title="Navegador"
      icon="🌐"
      color="bg-gradient-to-b from-indigo-400 to-indigo-600 text-white"
      onSettingsClick={onSettingsClick}
      hasUnreadMessages={hasUnreadMessages}
      logoAura={logoAura}
    />
  );
};

export default BrowserApp;
