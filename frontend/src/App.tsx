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
import Incidents from "./pages/Incidents";
import Charges from "./pages/Charges";
import People from "./pages/People";
import Locations from "./pages/Locations";
import Evidence from "./pages/Evidence";
import Forensics from "./pages/Forensics";
import Vehicles from "./pages/Vehicles";
import Weapons from "./pages/Weapons";
import Reports from "./pages/Reports";
import Prisons from "./pages/Prisons";
import Sentences from "./pages/Sentences";
import CollectionPage from "./pages/CollectionPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ClickSpark from "@/components/ClickSpark";
import UserList from "./pages/UserList";
import CreateUserForm from "./pages/CreateUserForm";
import EditUserForm from "./pages/EditUserForm";
import { RequireAdmin, RequireRole } from "./components/RequireRole";

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
                        <RequireRole allowedRoles={['admin', 'officer']}>
                            <DashboardLayout>
                                <Cases />
                            </DashboardLayout>
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/arrests"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={['admin', 'officer']}>
                            <DashboardLayout>
                                <Arrests />
                            </DashboardLayout>
                        </RequireRole>
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
                            <People />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/incidents"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Incidents />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/charges"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Charges />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/locations"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Locations />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/evidence"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={['admin', 'officer']}>
                            <DashboardLayout>
                                <Evidence />
                            </DashboardLayout>
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/forensics"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={['admin', 'officer']}>
                            <DashboardLayout>
                                <Forensics />
                            </DashboardLayout>
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/reports"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={['admin', 'officer']}>
                            <DashboardLayout>
                                <Reports />
                            </DashboardLayout>
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/prisons"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={['admin', 'officer']}>
                            <DashboardLayout>
                                <Prisons />
                            </DashboardLayout>
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/sentences"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={['admin', 'officer']}>
                            <DashboardLayout>
                                <Sentences />
                            </DashboardLayout>
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/vehicles"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={['admin', 'officer']}>
                            <DashboardLayout>
                                <Vehicles />
                            </DashboardLayout>
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/weapons"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={['admin', 'officer']}>
                            <DashboardLayout>
                                <Weapons />
                            </DashboardLayout>
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            {/* Admin-only routes */}
            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute>
                        <RequireAdmin>
                            <DashboardLayout>
                                <UserList />
                            </DashboardLayout>
                        </RequireAdmin>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/users/create"
                element={
                    <ProtectedRoute>
                        <RequireAdmin>
                            <DashboardLayout>
                                <CreateUserForm />
                            </DashboardLayout>
                        </RequireAdmin>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/users/edit/:id"
                element={
                    <ProtectedRoute>
                        <RequireAdmin>
                            <DashboardLayout>
                                <EditUserForm />
                            </DashboardLayout>
                        </RequireAdmin>
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
