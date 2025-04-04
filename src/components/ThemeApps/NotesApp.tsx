
import React from 'react';
import GenericAppTemplate from './GenericAppTemplate';

interface NotesAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
  logoAura?: 'none' | 'green' | 'red';
}

const NotesApp: React.FC<NotesAppProps> = ({ onSettingsClick, hasUnreadMessages = false, logoAura = 'none' }) => {
  return (
    <GenericAppTemplate
      title="Notas"
      icon="📝"
      color="bg-gradient-to-b from-yellow-200 to-yellow-400 text-gray-800"
      onSettingsClick={onSettingsClick}
      hasUnreadMessages={hasUnreadMessages}
      logoAura={logoAura}
    />
  );
};

export default NotesApp;
