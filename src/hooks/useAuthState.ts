
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';

export const useAuthState = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [isCreatePattern, setIsCreatePattern] = useState(false);
  const [newPattern, setNewPattern] = useState<number[]>([]);
  const [step, setStep] = useState(1);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useSupabaseAuth();
  
  // Check for first login status
  useEffect(() => {
    // If user is logged in for the first time
    if (user && sessionStorage.getItem('firstLogin') === 'true') {
      console.log("First login detected, starting pattern creation");
      startPatternCreation();
    }
  }, [user]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  const showResetPassword = () => setIsResetPassword(true);
  const hideResetPassword = () => setIsResetPassword(false);
  
  const showRecoveryMode = () => setIsRecoveryMode(true);
  const hideRecoveryMode = () => setIsRecoveryMode(false);

  const startPatternCreation = () => {
    setIsCreatePattern(true);
  };
  
  const handlePatternStep = (pattern: number[], isComplete: boolean) => {
    if (step === 1) {
      setNewPattern(pattern);
      setStep(2);
      return true;
    } else if (isComplete) {
      setIsCreatePattern(false);
      // Clear the first login flag
      sessionStorage.removeItem('firstLogin');
      return true;
    }
    return false;
  };

  const handleSignupSuccess = () => {
    // After signup, return to login screen
    toast({
      title: "Registro exitoso",
      description: "Por favor, inicia sesión con tus credenciales",
    });
    
    // Switch to login mode
    setIsLogin(true);
  };

  return {
    // State
    isLogin,
    isResetPassword,
    isRecoveryMode,
    isCreatePattern,
    newPattern,
    step,
    user,
    loading,
    
    // Actions
    toggleMode,
    showResetPassword,
    hideResetPassword,
    showRecoveryMode,
    hideRecoveryMode,
    startPatternCreation,
    handlePatternStep,
    handleSignupSuccess,
    setStep,
    setIsLogin
  };
};
