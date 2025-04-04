
import React from 'react';
import GenericAppTemplate from './GenericAppTemplate';

interface FitnessAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
  logoAura?: 'none' | 'green' | 'red';
}

const FitnessApp: React.FC<FitnessAppProps> = ({ onSettingsClick, hasUnreadMessages = false, logoAura = 'none' }) => {
  return (
    <GenericAppTemplate
      title="Fitness"
      icon="🏃"
      color="bg-gradient-to-b from-green-400 to-green-600 text-white"
      onSettingsClick={onSettingsClick}
      hasUnreadMessages={hasUnreadMessages}
      logoAura={logoAura}
    />
  );
};

export default FitnessApp;
