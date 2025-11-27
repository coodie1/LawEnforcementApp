import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import Arrests from "./pages/Arrests";
import Officers from "./pages/Officers";
import Departments from "./pages/Departments";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
};

const AppRoutes = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route
                path="/auth"
                element={isAuthenticated ? <Navigate to="/" replace /> : <Auth />}
            />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Dashboard />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/cases"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Cases />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/arrests"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Arrests />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/officers"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Officers />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/departments"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Departments />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/people"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <div className="text-center text-muted-foreground py-12">
                                People page - Integration coming soon
                            </div>
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/incidents"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <div className="text-center text-muted-foreground py-12">
                                Incidents page - Integration coming soon
                            </div>
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/charges"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <div className="text-center text-muted-foreground py-12">
                                Charges page - Integration coming soon
                            </div>
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

const App = () => (
    <QueryClientProvider client={queryClient}>
        <BrowserRouter>
            <AuthProvider>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <AppRoutes />
                </TooltipProvider>
            </AuthProvider>
        </BrowserRouter>
    </QueryClientProvider>
);

export default App;
