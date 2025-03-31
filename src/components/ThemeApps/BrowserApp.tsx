
import React from 'react';
import GenericAppTemplate from './GenericAppTemplate';

interface BrowserAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
}

const BrowserApp: React.FC<BrowserAppProps> = ({ onSettingsClick, hasUnreadMessages = false }) => {
  return (
    <GenericAppTemplate
      title="Navegador"
      icon="🌐"
      color="bg-gradient-to-b from-indigo-400 to-indigo-600 text-white"
      onSettingsClick={onSettingsClick}
      hasUnreadMessages={hasUnreadMessages}
    />
  );
};

export default BrowserApp;
