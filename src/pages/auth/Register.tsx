import { useState, useRef, useLayoutEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Building,
  Quote,
  CheckCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/shared/Logo";
import type { UserRole } from "@/types/auth.types";
import { TurnstileWidget } from "@/components/common/TurnstileWidget";
import { useThemeStore } from "@/stores/theme.store";
import { GoogleLogin } from "@react-oauth/google";
import { SEO } from "@/components/SEO/SEO";
import AuthFormPanel from "@/components/auth/AuthFormPanel";
import { isInAppBrowser } from "@/lib/oauth";

type Step = "role" | "form";

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") as UserRole;
  const isValidRole = initialRole === "client" || initialRole === "freelancer";

  const [step, setStep] = useState<Step>(isValidRole ? "form" : "role");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(
    isValidRole ? initialRole : null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const {
    register: registerAction,
    signInWithGoogleIdToken,
    isLoading,
    error,
    clearError,
  } = useAuth();
  const { theme } = useThemeStore();
  const [inAppBrowserDetected] = useState(() => isInAppBrowser());

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

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    primarySkill: "Video Editing",
    password: "",
    confirmPassword: "",
    city: "",
    state: "",
  });
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
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

  const isPasswordValid = (pw: string) => {
    return (
      pw.length >= 8 &&
      pw.length <= 72 &&
      /[A-Z]/.test(pw) &&
      /[a-z]/.test(pw) &&
      /[0-9]/.test(pw) &&
      /[^A-Za-z0-9]/.test(pw)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) return;

    if (!isPasswordValid(formData.password)) {
      // Error is also handled by providing specific feedback under the field
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!turnstileToken) {
      toast.error("Please complete the security challenge");
      return;
    }

    try {
      // Sanitize: Convert empty strings to undefined to avoid backend min(1) validation errors.
      const submissionData = {
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        phone: formData.phone.replace(/\D/g, "").slice(-10),
        firstName: formData.firstName.trim() || undefined,
        lastName:
          selectedRole === "freelancer"
            ? formData.lastName.trim() || undefined
            : undefined,
        city: formData.city.trim() || undefined,
        state: (formData.state.trim() as any) || undefined,
        turnstileToken,
      };

      await registerAction(submissionData);
    } catch {
      // Error is handled in the hook
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      <SEO
        title="Create Account | ConnectMeIndia"
        description="Join ConnectMeIndia as a client or freelancer. Post projects, find work, and collaborate across India."
        canonical="/register"
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

      {/* RIGHT SIDE - Register Form (mobile-first) */}
      <AuthFormPanel
        maxWidth="lg"
        loadingOverlay={
          isLoading ? (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-[#121A2A] p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 flex flex-col items-center gap-4 mx-4">
                <Loader2 className="w-8 h-8 animate-spin text-teal" />
                <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">
                  Creating your account...
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
                Create Account
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                {step === "role"
                  ? "Choose your account type"
                  : selectedRole === "client"
                    ? "Tell us about your business"
                    : "Tell us about yourself"}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {inAppBrowserDetected && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm flex items-start gap-2">
                <ExternalLink size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">You're using an in-app browser</p>
                  <p className="text-blue-700">
                    For the best experience, tap the menu (⋯) and choose{" "}
                    <strong>"Open in Chrome"</strong> or <strong>"Open in Safari"</strong>.
                    Some features may not work inside social media apps.
                  </p>
                </div>
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

                {/* OAuth Buttons */}
                <div className="space-y-3" ref={containerRef}>
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
                          console.error("Google Sign Up Failed");
                        }}
                        text="signup_with"
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

                {selectedRole === "client" ? (
                  <>
                    {/* Client Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Full Name
                        </label>
                        <div className="relative">
                          <User
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                          />
                          <Input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className="pl-11 h-12"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Freelancer Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          First Name
                        </label>
                        <div className="relative">
                          <User
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                          />
                          <Input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Enter your first name"
                            className="pl-11 h-12"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Last Name
                        </label>
                        <div className="relative">
                          <User
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                          />
                          <Input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Enter your last name"
                            className="pl-11 h-12"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      className="pl-11 h-12"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className="pl-11 h-12"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="pl-11 pr-11 h-12"
                      required
                      minLength={8}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {/* Password Feedback */}
                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      <p
                        className={cn(
                          "text-xs flex items-center gap-1.5",
                          formData.password.length >= 8
                            ? "text-green-600"
                            : "text-slate-400",
                        )}
                      >
                        <CheckCircle size={10} /> Length (min 8)
                      </p>
                      <p
                        className={cn(
                          "text-xs flex items-center gap-1.5",
                          /[A-Z]/.test(formData.password) &&
                            /[a-z]/.test(formData.password)
                            ? "text-green-600"
                            : "text-slate-400",
                        )}
                      >
                        <CheckCircle size={10} /> Mixed Case (Aa)
                      </p>
                      <p
                        className={cn(
                          "text-xs flex items-center gap-1.5",
                          /[0-9]/.test(formData.password)
                            ? "text-green-600"
                            : "text-slate-400",
                        )}
                      >
                        <CheckCircle size={10} /> Number (0-9)
                      </p>
                      <p
                        className={cn(
                          "text-xs flex items-center gap-1.5",
                          /[^A-Za-z0-9]/.test(formData.password)
                            ? "text-green-600"
                            : "text-slate-400",
                        )}
                      >
                        <CheckCircle size={10} /> Special symbol (@$!)
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <Input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="pl-11 pr-11 h-12"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    id="terms-checkbox"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-teal focus:ring-teal mt-0.5 cursor-pointer"
                    required
                    disabled={isLoading}
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    <label htmlFor="terms-checkbox" className="cursor-pointer">
                      I have read and agree to the{" "}
                    </label>
                    <Link
                      to="/terms-and-conditions"
                      className="text-teal hover:underline"
                      target="_blank"
                    >
                      ConnectMeIndia Terms & Conditions
                    </Link>
                    <label htmlFor="terms-checkbox" className="cursor-pointer">
                      {" "}
                      and acknowledge that ConnectMeIndia only connects Clients
                      and Freelancers. All payments, agreements, and project
                      decisions are solely my responsibility.
                    </label>
                  </span>
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
                  disabled={isLoading || !agreedToTerms}
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
                      Creating Account...
                    </span>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Sign In Link */}
            <p className="text-center mt-8 text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-teal font-semibold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
      </AuthFormPanel>
    </div>
  );
};

export default Register;
