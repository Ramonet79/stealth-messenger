
import React from 'react';
import GenericAppTemplate from './GenericAppTemplate';

interface RadarAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
  logoAura?: 'none' | 'green' | 'red';
}

const RadarApp: React.FC<RadarAppProps> = ({ onSettingsClick, hasUnreadMessages = false, logoAura = 'none' }) => {
  return (
    <GenericAppTemplate
      title="Radar"
      icon="📡"
      color="bg-gradient-to-b from-gray-700 to-gray-900 text-white"
      onSettingsClick={onSettingsClick}
      hasUnreadMessages={hasUnreadMessages}
      logoAura={logoAura}
    />
  );
};

export default RadarApp;
