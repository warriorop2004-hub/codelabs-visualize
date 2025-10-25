import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Experiment from "./pages/Experiment";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Course from "./pages/Course";
import SubmissionView from "@/pages/SubmissionView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<Index />} />

            {/* Protected student routes */}
            <Route
              path="/experiment/:slug"
              element={
                <ProtectedRoute roles={["student"]}>
                  <Experiment />
                </ProtectedRoute>
              }
            />

            {/* Protected routes for both roles */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected instructor routes */}
            <Route
              path="/course/:courseId"
              element={
                <ProtectedRoute roles={["instructor"]}>
                  <Course/>
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/:courseId/experiment/:experimentId/submissions"
              element={
                <ProtectedRoute roles={["instructor"]}>
                  <SubmissionView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <Library />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
