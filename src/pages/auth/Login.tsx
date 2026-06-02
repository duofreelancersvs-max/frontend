import { useState } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Quote, Github, Briefcase, Building, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";
import type { UserRole } from "@/types/auth.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import axiosClient from "@/lib/axios-client";
import type { CustomAxiosRequestConfig } from "@/lib/axios-client";
import { formatBackendApiError } from "@/lib/auth-request-errors";

const Login = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const sessionExpired = (location.state as { sessionExpired?: boolean } | null)?.sessionExpired ?? false;
  const initialRole = searchParams.get("role") as UserRole;
  const isValidRole = initialRole === "client" || initialRole === "freelancer";

  const [step, setStep] = useState<"role" | "form">(isValidRole ? "form" : "role");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(isValidRole ? initialRole : null);
  const [showPassword, setShowPassword] = useState(false);
  const { login, signInWithOAuth, isLoading, error, clearError } = useAuth();
  const [showSessionBanner, setShowSessionBanner] = useState(sessionExpired);
  const [showVerifiedBanner, setShowVerifiedBanner] = useState(
    (location.state as { emailVerified?: boolean } | null)?.emailVerified ?? false
  );
  const [resending, setResending] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleRoleSelect = (role: UserRole) => {
    if (role === "client" || role === "freelancer") {
      setSelectedRole(role);
    }
  };

  const handleContinue = () => {
    if (selectedRole) {
      setStep("form");
    }
  };

  const handleBack = () => {
    setStep("role");
    setSelectedRole(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({
        email: formData.email,
        password: formData.password,
        role: selectedRole || undefined,
      });
    } catch {
      // Error is handled in the hook
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) return;

    setResending(true);
    try {
      await axiosClient.post(
        "/auth/resend-verification-email",
        { email: formData.email },
        {
          skipAuth: true,
        } satisfies Partial<CustomAxiosRequestConfig> as CustomAxiosRequestConfig,
      );
      toast.success("Verification email resent! Please check your inbox.");
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? formatBackendApiError(err, "Failed to resend verification email.")
        : "Failed to resend verification email.";
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    if (!selectedRole) return;

    try {
      await signInWithOAuth(provider, selectedRole);
    } catch {
      // Error is handled in the hook
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* LEFT SIDE - Branding */}
      <div className="hidden md:flex md:w-[40%] lg:w-[45%] relative bg-navy overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050B15] via-navy to-royal-blue" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-royal-blue/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
        <div className="absolute inset-0 bg-gradient-to-br from-navy/20 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo size="lg" isDark={true} />

          {/* Center Content */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Connect.
              <br />
              Create.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-light to-sky-blue">
                Collaborate.
              </span>
            </h2>
            <p className="text-slate-300 text-lg max-w-md">
              Join the leading marketplace for creative professionals in
              Telangana and Andhra Pradesh.
            </p>

            {/* Illustration Placeholder */}
            <div className="mt-12 relative">
              <div className="grid grid-cols-3 gap-4">
                {["VE", "VFX", "3D"].map((item, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "aspect-square rounded-2xl flex items-center justify-center text-white font-bold text-2xl",
                      idx === 0
                        ? "bg-gradient-to-br from-teal to-teal-light"
                        : idx === 1
                          ? "bg-gradient-to-br from-royal-blue to-blue-500"
                          : "bg-gradient-to-br from-gold to-orange-500",
                    )}
                    style={{ animationDelay: `${idx * 0.2}s` }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <Quote size={24} className="text-teal-light mb-3" />
            <p className="text-white/90 italic mb-4">
              "ConnectMeIndia helped me find amazing video editors for my
              production company. The quality of talent here is exceptional!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white font-bold text-sm">
                RK
              </div>
              <div>
                <div className="text-white font-semibold">Rahul Kumar</div>
                <div className="text-white/60 text-sm">Founder, MediaWorks</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-start lg:justify-center bg-slate-50 dark:bg-background relative py-20 lg:py-24 overflow-y-auto">
        <div className="w-full absolute top-0 left-0 p-6 flex items-center justify-between md:justify-end lg:p-10 lg:gap-6 z-30">
          <div className="md:hidden">
            <Logo size="sm" />
          </div>
          <div className="flex items-center gap-4 lg:gap-6">
            <ThemeToggle />
            <Link to="/">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white rounded-xl transition-all border border-slate-200 dark:border-white/10 lg:border-none flex items-center px-4"
              >
                <ArrowLeft size={16} className="mr-2" />
                <span className="font-bold text-xs uppercase tracking-wider">Home</span>
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="w-full max-w-md px-4 sm:px-0">
          {/* Mobile Logo */}
          {/* Mobile Logo spacer - removed overlap */}
          <div className="md:hidden mb-6" />

          {/* Form Card */}
          <div className="bg-white dark:bg-white/5 rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-100 dark:border-white/10">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-navy dark:text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                {step === "role"
                  ? "Choose your account type"
                  : "Sign in to your account"}
              </p>
            </div>

            {showVerifiedBanner && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-2">
                <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
                <span>
                  Email verified! You can now sign in.
                  <button
                    type="button"
                    onClick={() => setShowVerifiedBanner(false)}
                    className="ml-2 font-bold underline hover:no-underline"
                  >
                    Dismiss
                  </button>
                </span>
              </div>
            )}

            {showSessionBanner && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-start gap-2">
                <span className="text-base">⏱️</span>
                <span>
                  Your session has expired. Please sign in again.
                  <button
                    type="button"
                    onClick={() => setShowSessionBanner(false)}
                    className="ml-2 font-bold underline hover:no-underline"
                  >
                    Dismiss
                  </button>
                </span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <p>{error}</p>
                {error.toLowerCase().includes("email not verified") && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="mt-2 flex items-center gap-1.5 text-red-700 font-medium hover:underline"
                  >
                    <RefreshCw size={14} className={resending ? "animate-spin" : ""} />
                    {resending ? "Resending..." : "Resend verification email"}
                  </button>
                )}
              </div>
            )}

            {step === "role" ? (
              <div className="space-y-4">
                {/* Role Selection Cards */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("client")}
                  className={cn(
                    "w-full p-6 rounded-xl border-2 text-left transition-all",
                    selectedRole === "client"
                      ? "border-teal bg-teal/5"
                      : "border-slate-200 hover:border-teal/50",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        selectedRole === "client"
                          ? "bg-teal text-white"
                          : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400",
                      )}
                    >
                      <Building size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-navy dark:text-white mb-1">
                        I&apos;m a Client
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Looking to hire talented professionals for my projects
                      </p>
                    </div>
                    {selectedRole === "client" && (
                      <CheckCircle className="text-teal" size={24} />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("freelancer")}
                  className={cn(
                    "w-full p-6 rounded-xl border-2 text-left transition-all",
                    selectedRole === "freelancer"
                      ? "border-teal bg-teal/5"
                      : "border-slate-200 hover:border-teal/50",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        selectedRole === "freelancer"
                          ? "bg-teal text-white"
                          : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400",
                      )}
                    >
                      <Briefcase size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-navy dark:text-white mb-1">
                        I&apos;m a Freelancer
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Looking for exciting projects and opportunities
                      </p>
                    </div>
                    {selectedRole === "freelancer" && (
                      <CheckCircle className="text-teal" size={24} />
                    )}
                  </div>
                </button>

                <Button
                  onClick={handleContinue}
                  disabled={!selectedRole}
                  className="w-full h-12 bg-teal hover:bg-teal-light text-white font-bold text-base shadow-lg shadow-teal/25 mt-6"
                >
                  Continue
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Back Button */}
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white transition-colors mb-4"
                >
                  <ArrowLeft size={18} className="mr-1" />
                  Back
                </button>

                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="pl-11 h-12 bg-slate-50 border-slate-200 focus:border-teal focus:ring-teal"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="pl-11 pr-11 h-12 bg-slate-50 border-slate-200 focus:border-teal focus:ring-teal"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-slate-300 text-teal focus:ring-teal"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-slate-600">Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-teal font-medium hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-teal hover:bg-teal-light text-white font-bold text-base shadow-lg shadow-teal/25"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </span>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-[#121A2A] text-slate-500 dark:text-slate-400 rounded-full">OR</span>
                  </div>
                </div>

                {/* OAuth Buttons */}
                <div className="space-y-3">
                  {/* Google Sign In */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-white/5 font-medium transition-all"
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </Button>

                  {/* GitHub Sign In */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-white/5 font-medium transition-all"
                    onClick={() => handleOAuthSignIn('github')}
                    disabled={isLoading}
                  >
                    <Github className="w-5 h-5 mr-3" />
                    Sign in with GitHub
                  </Button>
                </div>
              </form>
            )}

            <p className="text-center mt-8 text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="text-teal font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
