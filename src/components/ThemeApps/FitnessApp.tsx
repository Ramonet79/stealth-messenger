
import React from 'react';
import GenericAppTemplate from './GenericAppTemplate';

interface FitnessAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
}

const FitnessApp: React.FC<FitnessAppProps> = ({ onSettingsClick, hasUnreadMessages = false }) => {
  return (
    <GenericAppTemplate
      title="Fitness"
      icon="🏃"
      color="bg-gradient-to-b from-green-400 to-green-600 text-white"
      onSettingsClick={onSettingsClick}
      hasUnreadMessages={hasUnreadMessages}
    />
  );
};

export default FitnessApp;
