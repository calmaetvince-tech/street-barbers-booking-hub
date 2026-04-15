import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

// Lazy load admin routes — never loaded for public users
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AdminFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/login" element={<Suspense fallback={<AdminFallback />}><AdminLogin /></Suspense>} />
          <Route path="/admin" element={<Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
