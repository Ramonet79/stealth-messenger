
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
  const [emailSent, setEmailSent] = useState(false);
  const [confirmationError, setConfirmationError] = useState<string | null>(null);
  const [processingConfirmation, setProcessingConfirmation] = useState(false);
  const [confirmationSuccess, setConfirmationSuccess] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useSupabaseAuth();
  
  // Extract URL parameters
  const searchParams = new URLSearchParams(location.search);
  const hasConfirmSuccess = searchParams.get('confirmSuccess') === 'true';

  useEffect(() => {
    // If the user reaches the auth page with #access_token in the URL
    // this is a callback from Supabase Auth, we let Supabase process it
    if (window.location.hash && window.location.hash.includes('access_token')) {
      console.log("Detected Supabase Auth callback URL");
      // Supabase will automatically process this hash
      // The onAuthStateChange event will handle the result
    }
    
    // If confirmSuccess=true is in the URL, but no user is logged in
    if (hasConfirmSuccess && !user) {
      console.log("Account verified, redirecting to login");
      setConfirmationSuccess(true);
      // Clean the URL to avoid repeated attempts
      window.history.replaceState({}, '', '/auth');
    }
    
    // If user is confirmed and just logged in (firstLoginAfterConfirmation)
    if (user && sessionStorage.getItem('firstLoginAfterConfirmation') === 'true') {
      console.log("User confirmed and logged in, starting pattern creation");
      startPatternCreation();
    }
  }, [user, hasConfirmSuccess, location]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmailSent(false);
  };

  const showResetPassword = () => setIsResetPassword(true);
  const hideResetPassword = () => setIsResetPassword(false);
  
  const showRecoveryMode = () => setIsRecoveryMode(true);
  const hideRecoveryMode = () => setIsRecoveryMode(false);

  const startPatternCreation = () => {
    setIsCreatePattern(true);
    setEmailSent(false);
  };
  
  const handlePatternStep = (pattern: number[], isComplete: boolean) => {
    if (step === 1) {
      setNewPattern(pattern);
      setStep(2);
      return true;
    } else if (isComplete) {
      setIsCreatePattern(false);
      return true;
    }
    return false;
  };

  const handleSignupSuccess = () => {
    setEmailSent(true);
  };
  
  const handleLoginAfterConfirmation = () => {
    setConfirmationSuccess(false);
    setIsLogin(true);
    
    // Auto-fill email if available
    const email = searchParams.get('email');
    if (email) {
      sessionStorage.setItem('autoFillEmail', email);
      toast({
        title: "Email recordado",
        description: "Hemos rellenado automáticamente tu email para facilitar el inicio de sesión",
      });
    }
  };

  return {
    // State
    isLogin,
    isResetPassword,
    isRecoveryMode,
    isCreatePattern,
    newPattern,
    step,
    emailSent,
    confirmationError,
    processingConfirmation,
    confirmationSuccess,
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
    handleLoginAfterConfirmation,
    setStep,
    // Add missing functions
    setEmailSent,
    setConfirmationError,
    setIsLogin
  };
};
