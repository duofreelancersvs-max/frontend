import { useState, useRef, useLayoutEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Quote,
  Briefcase,
  Building,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { UserRole } from "@/types/auth.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { isAxiosError, type AxiosRequestHeaders } from "axios";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/shared/Logo";
import axiosClient from "@/lib/axios-client";
import type { CustomAxiosRequestConfig } from "@/lib/axios-client";
import { formatBackendApiError } from "@/lib/auth-request-errors";
import { TurnstileWidget } from "@/components/common/TurnstileWidget";
import { useThemeStore } from "@/stores/theme.store";
import { GoogleLogin } from "@react-oauth/google";
import { SEO } from "@/components/SEO/SEO";
import AuthFormPanel from "@/components/auth/AuthFormPanel";

const Login = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const sessionExpired =
    (location.state as { sessionExpired?: boolean } | null)?.sessionExpired ??
    (searchParams.get("reason") === "session_invalidated" || searchParams.get("reason") === "session_expired");
  const initialRole = searchParams.get("role") as UserRole;
  const isValidRole =
    initialRole === "client" ||
    initialRole === "freelancer" ||
    initialRole === "admin";

  const [step, setStep] = useState<"role" | "form">(
    isValidRole ? "form" : "role",
  );
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(
    isValidRole ? initialRole : null,
  );
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, signInWithGoogleIdToken, isLoading, error, clearError } =
    useAuth();
  const { theme } = useThemeStore();

  const [googleBtnWidth, setGoogleBtnWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (step === "form" && containerRef.current) {
      const width = containerRef.current.offsetWidth;
      if (width > 0) setGoogleBtnWidth(width);

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newWidth = (entry.target as HTMLElement).offsetWidth;
          if (newWidth > 0) setGoogleBtnWidth(newWidth);
        }
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [step]);

  const [showSessionBanner, setShowSessionBanner] = useState(sessionExpired);
  const [showVerifiedBanner, setShowVerifiedBanner] = useState(
    (location.state as { emailVerified?: boolean } | null)?.emailVerified ??
      false,
  );
  const [resending, setResending] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

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
    if (!turnstileToken) {
      toast.error("Please complete the security challenge");
      return;
    }
    try {
      await login({
        email: formData.email,
        password: formData.password,
        role: selectedRole || undefined,
        turnstileToken,
      });
    } catch {
      // Error is handled in the hook
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) return;
    if (!turnstileToken) {
      toast.error("Please complete the security challenge before resending");
      return;
    }

    setResending(true);
    try {
      await axiosClient.post(
        "/auth/resend-verification-email",
        { email: formData.email },
        {
          skipAuth: true,
          headers: (turnstileToken
            ? { "x-turnstile-token": turnstileToken }
            : {}) as AxiosRequestHeaders,
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

  return (
    <div className="min-h-screen flex font-sans">
      <SEO
        title="Sign In | ConnectMeIndia"
        description="Sign in to ConnectMeIndia to manage projects, messages, and your freelancer or client account."
        canonical="/login"
      />
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
              Join the leading marketplace for creative professionals in India.
            </p>

            {/* Generic skill category showcase */}
            <div className="mt-10 relative">
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Design",
                    sub: "UI/UX · Graphic",
                    gradient: "from-teal to-teal-light",
                  },
                  {
                    label: "Dev",
                    sub: "Web · Mobile",
                    gradient: "from-royal-blue to-blue-500",
                  },
                  {
                    label: "Video",
                    sub: "Edit · VFX",
                    gradient: "from-gold to-orange-500",
                  },
                  {
                    label: "Write",
                    sub: "Copy · Content",
                    gradient: "from-purple-600 to-pink-500",
                  },
                  {
                    label: "Market",
                    sub: "SEO · Ads",
                    gradient: "from-green-500 to-teal",
                  },
                  {
                    label: "More",
                    sub: "50+ skills",
                    gradient: "from-slate-600 to-slate-400",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-2xl flex flex-col items-center justify-center text-white font-bold py-4 px-2 bg-gradient-to-br",
                      item.gradient,
                    )}
                  >
                    <span className="text-base font-extrabold tracking-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] font-medium opacity-80 mt-0.5 text-center leading-tight">
                      {item.sub}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <Quote size={24} className="text-teal-light mb-3" />
            <p className="text-white font-semibold text-lg leading-snug mb-1">
              "The right talent, at the right time — right here in India."
            </p>
            <p className="text-white/70 text-sm italic mb-4">
              ConnectMeIndia transformed how I build creative teams. No
              middlemen, no delays — just exceptional talent.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white font-bold text-sm">
                V
              </div>
              <div>
                <div className="text-white font-semibold">Vignan</div>
                <div className="text-white/60 text-sm">
                  Founder, ConnectMeIndia
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form (mobile-first) */}
      <AuthFormPanel
        loadingOverlay={
          isLoading ? (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-[#121A2A] p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 flex flex-col items-center gap-4 mx-4">
                <Loader2 className="w-8 h-8 animate-spin text-teal" />
                <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">
                  Signing you in...
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Please wait a moment
                </p>
              </div>
            </div>
          ) : undefined
        }
      >
          {/* Form Card */}
          <div className="bg-white dark:bg-white/5 rounded-2xl shadow-xl p-5 sm:p-8 border border-slate-100 dark:border-white/10">
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
                <CheckCircle
                  size={18}
                  className="text-green-600 shrink-0 mt-0.5"
                />
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
                  {searchParams.get("reason") === "session_invalidated" 
                    ? "You have been logged out because your account was accessed from another device."
                    : searchParams.get("reason") === "session_expired"
                    ? "Your session has expired after 24 hours. Please log in again."
                    : "Your session has expired. Please sign in again."}
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
                    <RefreshCw
                      size={14}
                      className={resending ? "animate-spin" : ""}
                    />
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

                {/* Terms and Conditions Checkbox */}
                <div className="flex items-start mt-6">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-teal focus:ring-teal dark:border-white/20 dark:bg-white/5 dark:focus:ring-teal-light"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="terms"
                      className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      I agree with the{" "}
                      <Link
                        to="/terms-and-conditions"
                        className="text-teal hover:underline dark:text-teal-light"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Terms and Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy-policy"
                        className="text-teal hover:underline dark:text-teal-light"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={!selectedRole || !agreedToTerms}
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

                {selectedRole !== "admin" && (
                  <>
                    {/* OAuth Buttons */}
                    <div className="space-y-3" ref={containerRef}>
                      {/* Google Sign In */}
                      <div className="flex justify-center w-full relative z-10 overflow-hidden rounded-lg">
                        {googleBtnWidth > 0 && (
                          <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                              if (credentialResponse.credential && selectedRole) {
                                try {
                                  await signInWithGoogleIdToken(
                                    credentialResponse.credential,
                                    selectedRole,
                                  );
                                } catch {
                                  // Error is handled in the hook
                                }
                              }
                            }}
                            onError={() => {
                              console.error("Google Sign In Failed");
                            }}
                            text="signin_with"
                            theme={theme === "dark" ? "filled_black" : "outline"}
                            size="large"
                            shape="rectangular"
                            width={googleBtnWidth > 400 ? 400 : googleBtnWidth}
                          />
                        )}
                        {isLoading && (
                          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] cursor-not-allowed">
                            <Loader2 className="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200 dark:border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white dark:bg-[#121A2A] text-slate-500 dark:text-slate-400 rounded-full">
                          OR
                        </span>
                      </div>
                    </div>
                  </>
                )}

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
                      placeholder="Enter your email address"
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

                {/* Forgot Password */}
                <div className="flex items-center justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-teal font-medium hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <TurnstileWidget
                  onSuccess={(token) => {
                    setTurnstileToken(token);
                  }}
                  onExpire={() => setTurnstileToken(null)}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-teal hover:bg-teal-light text-white font-bold text-base shadow-lg shadow-teal/25"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
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
              </form>
            )}

            <div className="text-center mt-8">
              <p className="text-slate-500 dark:text-slate-400">
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
      </AuthFormPanel>
    </div>
  );
};

export default Login;
