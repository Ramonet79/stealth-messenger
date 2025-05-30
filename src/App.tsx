
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useSupabaseAuth } from "./hooks/useSupabaseAuth";
import { useEffect } from "react";
import { Capacitor } from '@capacitor/core';

// Set page title
document.title = "dScrt";

// Log platform information
console.log("Ejecutando en plataforma:", Capacitor.getPlatform());
console.log("¿Es plataforma nativa?:", Capacitor.isNativePlatform());

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useSupabaseAuth();

  // Check for first login flag
  useEffect(() => {
    if (user && sessionStorage.getItem('firstLogin') === 'true') {
      console.log("First login detected in ProtectedRoute, pattern creation will be triggered");
    }
    
    // Verificar que estamos en una plataforma nativa y registrar información
    if (Capacitor.isNativePlatform()) {
      console.log("Ejecutando en dispositivo nativo:", Capacitor.getPlatform());
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } 
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
