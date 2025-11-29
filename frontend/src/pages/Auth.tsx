import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { GlowCard } from "@/components/ui/spotlight-card";
import { TechBackground } from "@/components/ui/tech-background";
import { Shield, Lock, User, Mail, Building2, ArrowRight, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"officer" | "public">("public");
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Keep form open when any input is focused (for password managers)
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const handleFocusIn = () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setIsHovered(true);
    };

    const handleFocusOut = (e: FocusEvent) => {
      // Don't close if focus is moving to another element in the form
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (relatedTarget && form.contains(relatedTarget)) {
        return;
      }
      // Add a delay to allow for password manager interactions
      closeTimeoutRef.current = setTimeout(() => {
        // Double check that no input is focused
        const activeElement = document.activeElement;
        if (!form.contains(activeElement)) {
          setIsHovered(false);
        }
      }, 300);
    };

    form.addEventListener('focusin', handleFocusIn);
    form.addEventListener('focusout', handleFocusOut);

    return () => {
      form.removeEventListener('focusin', handleFocusIn);
      form.removeEventListener('focusout', handleFocusOut);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
        toast.success("Login successful!");
      } else {
        await register(username, password, firstName, lastName, role);
        toast.success("Registration successful!");
      }
      navigate("/");
    } catch (error: any) {
      const message = error.response?.data?.message ||
        (isLogin ? "Login failed. Please check your credentials." : "Registration failed. Please try again.");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900 p-4 relative overflow-hidden">
      {/* Tech Background */}
      <TechBackground className="z-0" />
      
      {/* Additional Background Effects */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full',
            'bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.02),transparent_60%)]',
            'blur-[60px]',
          )}
        />
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-6xl relative z-10">
        <div 
          ref={containerRef}
          className="relative rounded-2xl overflow-hidden shadow-2xl min-h-[600px] md:min-h-[700px] md:h-[700px]"
          onMouseLeave={(e) => {
            // Only close if mouse truly leaves the entire container
            const relatedTarget = e.relatedTarget as HTMLElement;
            if (!relatedTarget || !containerRef.current?.contains(relatedTarget)) {
              // Check if any input is focused before closing
              const activeElement = document.activeElement;
              const form = formRef.current;
              if (!form?.contains(activeElement)) {
                closeTimeoutRef.current = setTimeout(() => {
                  setIsHovered(false);
                }, 200);
              }
            }
          }}
        >
          {/* Left Side - Branding (Desktop Only) */}
          <div 
            className="hidden md:flex flex-col justify-between bg-gradient-to-br from-[#0b2c75] via-[#0a1f5c] to-[#0b2c75] p-12 text-white relative overflow-hidden h-full w-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer group"
            onMouseEnter={() => {
              if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = null;
              }
              setIsHovered(true);
            }}
            onTouchStart={() => setIsHovered(true)}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            
            <div className="relative z-10">
              {/* Header with Logo */}
              <div className="flex items-center gap-4 mb-12">
                <div className="h-16 w-16 bg-cyan-400/20 rounded-xl flex items-center justify-center border border-cyan-400/30 shadow-lg">
                  <Shield className="h-9 w-9 text-white stroke-2" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold leading-tight">Law Enforcement</h1>
                  <p className="text-white/80 text-base mt-1">System Portal</p>
                </div>
              </div>
              
              {/* Features List */}
              <div className="space-y-8 mt-16">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-cyan-400/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-cyan-400/30 shadow-md">
                    <Lock className="h-6 w-6 text-white stroke-2" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1.5">Secure Access</h3>
                    <p className="text-white/70 text-sm leading-relaxed">Enterprise-grade security for sensitive data</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-cyan-400/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-cyan-400/30 shadow-md">
                    <Building2 className="h-6 w-6 text-white stroke-2" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1.5">Centralized Management</h3>
                    <p className="text-white/70 text-sm leading-relaxed">Streamlined operations for law enforcement agencies</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-cyan-400/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-cyan-400/30 shadow-md">
                    <User className="h-6 w-6 text-white stroke-2" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1.5">Role-Based Access</h3>
                    <p className="text-white/70 text-sm leading-relaxed">Customized permissions for different user roles</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="relative z-10 mt-auto pt-8 border-t border-white/20">
              <p className="text-white/60 text-sm">
                © {new Date().getFullYear()} Law Enforcement System. All rights reserved.
              </p>
              {/* Hover Hint */}
              <div className="mt-4 flex items-center gap-2 text-white/50 text-xs group-hover:text-white/80 transition-colors">
                <span className="hidden group-hover:inline">Hover to reveal login form</span>
                <span className="group-hover:hidden">Hover to continue</span>
              </div>
            </div>

            {/* Decorative Element that Disappears on Hover */}
            <div className={cn(
              "absolute right-10 top-1/2 -translate-y-1/2 z-20 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
              "group-hover:opacity-0 group-hover:translate-x-8 group-hover:pointer-events-none"
            )}>
              <div className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-lg animate-pulse">
                  <ChevronRight className="h-8 w-8 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-white/80 text-sm font-semibold mb-1">Get Started</p>
                  <p className="text-white/60 text-xs">Hover to access</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div 
            ref={formRef}
            className={cn(
              "w-full bg-white dark:bg-slate-900 p-8 md:p-12 flex items-center",
              "md:absolute md:right-0 md:top-0 md:h-full md:w-[500px]",
              "md:transition-transform md:duration-300 md:ease-[cubic-bezier(0.4,0,0.2,1)] md:shadow-2xl",
              "md:translate-x-full md:z-20 md:overflow-y-auto",
              "md:backdrop-blur-sm md:will-change-transform",
              isHovered && "md:translate-x-0"
            )}
            onMouseEnter={() => {
              if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = null;
              }
              setIsHovered(true);
            }}
            onMouseLeave={(e) => {
              // Don't close if mouse is moving to an input or password manager popup
              const relatedTarget = e.relatedTarget as HTMLElement;
              if (relatedTarget && (
                relatedTarget.tagName === 'INPUT' ||
                relatedTarget.closest('input') ||
                relatedTarget.closest('[role="listbox"]') ||
                relatedTarget.closest('[data-radix-popper-content-wrapper]')
              )) {
                return;
              }
              // Add delay to allow for password manager clicks
              closeTimeoutRef.current = setTimeout(() => {
                const activeElement = document.activeElement;
                if (!formRef.current?.contains(activeElement)) {
                  setIsHovered(false);
                }
              }, 300);
            }}
            onClick={() => {
              // Keep form open on any click within it
              if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = null;
              }
              setIsHovered(true);
            }}
          >
            <div className="w-full space-y-8">
              {/* Mobile Logo */}
              <div className="md:hidden flex items-center justify-center mb-6">
                <div className="h-16 w-16 bg-gradient-to-br from-[#0b2c75] to-[#0a1f5c] rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Header */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {isLogin 
                    ? "Sign in to access your dashboard" 
                    : "Register to get started with the system"}
                </p>
          </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
                    <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-slate-700 dark:text-slate-300">
                          First Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="firstName"
                    type="text"
                            placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                            className="pl-10 h-11 !rounded-xl"
                  />
                        </div>
                </div>
                <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-slate-700 dark:text-slate-300">
                          Last Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="lastName"
                    type="text"
                            placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                            className="pl-10 h-11 !rounded-xl"
                  />
                </div>
                      </div>
                    </div>
            )}
                  
            <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-700 dark:text-slate-300">
                      Username
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                        className="pl-10 h-11 !rounded-xl"
              />
            </div>
                  </div>
                  
            <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                        className="pl-10 h-11 !rounded-xl"
              />
            </div>
                  </div>

            {!isLogin && (
              <div className="space-y-2">
                      <Label htmlFor="role" className="text-slate-700 dark:text-slate-300">
                        Role
                      </Label>
                <Select value={role} onValueChange={(value: "officer" | "public") => setRole(value)} disabled={isLoading}>
                        <SelectTrigger id="role" className="h-11 !rounded-xl">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public (View Only)</SelectItem>
                    <SelectItem value="officer">Officer (Full Access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-semibold bg-gradient-to-r from-[#0b2c75] to-[#0a1f5c] hover:from-[#0a1f5c] hover:to-[#0b2c75] shadow-lg" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      isLogin ? "Sign In" : "Create Account"
                    )}
            </Button>
          </form>

              {/* Toggle Login/Register */}
              <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
                    className="font-semibold text-[#0b2c75] dark:text-blue-400 hover:underline"
              disabled={isLoading}
            >
                    {isLogin ? "Sign up" : "Sign in"}
            </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
