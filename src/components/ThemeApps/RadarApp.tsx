
import React from 'react';
import GenericAppTemplate from './GenericAppTemplate';

interface RadarAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
}

const RadarApp: React.FC<RadarAppProps> = ({ onSettingsClick, hasUnreadMessages = false }) => {
  return (
    <GenericAppTemplate
      title="Radares"
      icon="🚗"
      color="bg-gradient-to-b from-red-400 to-red-600 text-white"
      onSettingsClick={onSettingsClick}
      hasUnreadMessages={hasUnreadMessages}
    />
  );
};

export default RadarApp;
