
import React from 'react';
import GenericAppTemplate from './GenericAppTemplate';

interface FlashlightAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
}

const FlashlightApp: React.FC<FlashlightAppProps> = ({ onSettingsClick, hasUnreadMessages = false }) => {
  return (
    <GenericAppTemplate
      title="Linterna"
      icon="🔦"
      color="bg-gradient-to-b from-yellow-400 to-yellow-600 text-white"
      onSettingsClick={onSettingsClick}
      hasUnreadMessages={hasUnreadMessages}
    />
  );
};

export default FlashlightApp;
