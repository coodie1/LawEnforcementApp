import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import Arrests from "./pages/Arrests";
import Officers from "./pages/Officers";
import Departments from "./pages/Departments";
import CollectionPage from "./pages/CollectionPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ClickSpark from "@/components/ClickSpark";

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
                            <CollectionPage 
                                collectionName="people"
                                title="People"
                                description="Manage all people records"
                                colorGradient="from-cyan-600 to-blue-600"
                                borderColor="#0891b2"
                                headerGradient="bg-gradient-to-r from-cyan-50 to-blue-50"
                                titleColor="text-cyan-900"
                            />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/incidents"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <CollectionPage 
                                collectionName="incidents"
                                title="Incidents"
                                description="Track and manage all incidents"
                                colorGradient="from-amber-600 to-orange-600"
                                borderColor="#d97706"
                                headerGradient="bg-gradient-to-r from-amber-50 to-orange-50"
                                titleColor="text-amber-900"
                            />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/charges"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <CollectionPage 
                                collectionName="charges"
                                title="Charges"
                                description="Manage all criminal charges"
                                colorGradient="from-rose-600 to-pink-600"
                                borderColor="#e11d48"
                                headerGradient="bg-gradient-to-r from-rose-50 to-pink-50"
                                titleColor="text-rose-900"
                            />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/locations"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <CollectionPage 
                                collectionName="locations"
                                title="Locations"
                                description="Manage location records"
                                colorGradient="from-teal-600 to-cyan-600"
                                borderColor="#0d9488"
                                headerGradient="bg-gradient-to-r from-teal-50 to-cyan-50"
                                titleColor="text-teal-900"
                            />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/evidence"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <CollectionPage 
                                collectionName="evidence"
                                title="Evidence"
                                description="Manage evidence records"
                                colorGradient="from-violet-600 to-purple-600"
                                borderColor="#7c3aed"
                                headerGradient="bg-gradient-to-r from-violet-50 to-purple-50"
                                titleColor="text-violet-900"
                            />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/forensics"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <CollectionPage 
                                collectionName="forensics"
                                title="Forensics"
                                description="Manage forensic analysis records"
                                colorGradient="from-indigo-600 to-blue-600"
                                borderColor="#4f46e5"
                                headerGradient="bg-gradient-to-r from-indigo-50 to-blue-50"
                                titleColor="text-indigo-900"
                            />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/reports"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <CollectionPage 
                                collectionName="reports"
                                title="Reports"
                                description="Manage all reports"
                                colorGradient="from-sky-600 to-blue-600"
                                borderColor="#0284c7"
                                headerGradient="bg-gradient-to-r from-sky-50 to-blue-50"
                                titleColor="text-sky-900"
                            />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/prisons"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <CollectionPage 
                                collectionName="prisons"
                                title="Prisons"
                                description="Manage prison facilities"
                                colorGradient="from-slate-600 to-gray-600"
                                borderColor="#475569"
                                headerGradient="bg-gradient-to-r from-slate-50 to-gray-50"
                                titleColor="text-slate-900"
                            />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/sentences"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <CollectionPage 
                                collectionName="sentences"
                                title="Sentences"
                                description="Manage sentencing records"
                                colorGradient="from-fuchsia-600 to-pink-600"
                                borderColor="#c026d3"
                                headerGradient="bg-gradient-to-r from-fuchsia-50 to-pink-50"
                                titleColor="text-fuchsia-900"
                            />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/vehicles"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <CollectionPage 
                                collectionName="vehicles"
                                title="Vehicles"
                                description="Manage vehicle records"
                                colorGradient="from-emerald-600 to-teal-600"
                                borderColor="#059669"
                                headerGradient="bg-gradient-to-r from-emerald-50 to-teal-50"
                                titleColor="text-emerald-900"
                            />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/weapons"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <CollectionPage 
                                collectionName="weapons"
                                title="Weapons"
                                description="Manage weapon records"
                                colorGradient="from-red-600 to-rose-600"
                                borderColor="#dc2626"
                                headerGradient="bg-gradient-to-r from-red-50 to-rose-50"
                                titleColor="text-red-900"
                            />
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
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
                <AuthProvider>
                    <TooltipProvider>
                        <ClickSpark
                            sparkColor="#ffffff"
                            sparkSize={8}
                            sparkRadius={30}
                            sparkCount={12}
                            duration={600}
                            easing="ease-out"
                        >
                            <div className="min-h-screen w-full">
                                <Toaster />
                                <Sonner />
                                <AppRoutes />
                            </div>
                        </ClickSpark>
                    </TooltipProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    </QueryClientProvider>
);

export default App;
