import { useState } from "react";
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
  Github,
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { UserRole } from "@/types/auth.types";

type Step = "role" | "form";

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") as UserRole;
  const isValidRole = initialRole === "client" || initialRole === "freelancer";

  const [step, setStep] = useState<Step>(isValidRole ? "form" : "role");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(isValidRole ? initialRole : null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { register, signInWithOAuth, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
    primarySkill: "Video Editing",
    password: "",
    confirmPassword: "",
    city: "",
    state: "",
  });

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

    try {
      // Sanitize: Convert empty strings to undefined to avoid backend min(1) validation errors.
      const submissionData = {
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        phone: formData.phone.replace(/\D/g, "").slice(-10),
        firstName: formData.firstName.trim() || undefined,
        lastName: selectedRole === "freelancer" ? (formData.lastName.trim() || undefined) : undefined,
        city: formData.city.trim() || undefined,
        state: (formData.state.trim() as any) || undefined,
      };

      await register(submissionData);
    } catch {
      // Error is handled in the hook
    }
  };

  const handleOAuthSignUp = async (provider: "google" | "github") => {
    if (!selectedRole) {
      // Should not happen if buttons are disabled, but good safety
      return;
    }

    try {
      await signInWithOAuth(provider, selectedRole);
    } catch {
      // Error is handled in the hook
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* LEFT SIDE - Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-navy overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050B15] via-navy to-royal-blue" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-royal-blue/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
        <div className="absolute inset-0 bg-gradient-to-br from-navy/20 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo isDark size="lg" />

          {/* Center Content */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Start Your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-light to-sky-blue">
                Journey.
              </span>
            </h2>
            <p className="text-slate-300 text-lg max-w-md">
              Join thousands of professionals connecting on India&apos;s leading
              creative marketplace.
            </p>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-3xl font-bold text-white mb-1">10K+</div>
                <div className="text-slate-400 text-sm">Active Users</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-3xl font-bold text-white mb-1">₹50Cr+</div>
                <div className="text-slate-400 text-sm">Projects Completed</div>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <Quote size={24} className="text-teal-light mb-3" />
            <p className="text-white/90 italic mb-4">
              "I found my dream clients within the first month. The platform is
              incredibly easy to use and the opportunities are endless!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white font-bold text-sm">
                SP
              </div>
              <div>
                <div className="text-white font-semibold">Sneha Patel</div>
                <div className="text-white/60 text-sm">Video Editor</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Registration Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#050B15] relative">
        <div className="w-full absolute top-0 left-0 p-6 flex items-center justify-between lg:justify-end lg:p-8 lg:gap-4 z-20">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
          <div className="flex items-center gap-3">
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

        <div className="w-full max-w-lg mt-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Logo size="md" />
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-white/5 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-white/10">
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

                {selectedRole === "client" ? (
                  <>
                    {/* Client Fields */}
                    <div className="grid grid-cols-2 gap-4">
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
                            placeholder="John Doe"
                            className="pl-11 h-12"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Company Name
                        </label>
                        <div className="relative">
                          <Building
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                          />
                          <Input
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            placeholder="Company Ltd"
                            className="pl-11 h-12"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Freelancer Fields */}
                    <div className="grid grid-cols-2 gap-4">
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
                            placeholder="John"
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
                            placeholder="Doe"
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
                      placeholder="john@example.com"
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
                      placeholder="9876543210"
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
                      placeholder="Create a password"
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
                      <p className={cn("text-xs flex items-center gap-1.5", formData.password.length >= 8 ? "text-green-600" : "text-slate-400")}>
                        <CheckCircle size={10} /> Length (min 8)
                      </p>
                      <p className={cn("text-xs flex items-center gap-1.5", /[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? "text-green-600" : "text-slate-400")}>
                        <CheckCircle size={10} /> Mixed Case (Aa)
                      </p>
                      <p className={cn("text-xs flex items-center gap-1.5", /[0-9]/.test(formData.password) ? "text-green-600" : "text-slate-400")}>
                        <CheckCircle size={10} /> Number (0-9)
                      </p>
                      <p className={cn("text-xs flex items-center gap-1.5", /[^A-Za-z0-9]/.test(formData.password) ? "text-green-600" : "text-slate-400")}>
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
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-teal focus:ring-teal mt-0.5"
                    required
                    disabled={isLoading}
                  />
                  <span className="text-sm text-slate-600">
                    I agree to the{" "}
                    <Link to="/terms" className="text-teal hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-teal hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

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
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                    onClick={() => handleOAuthSignUp("google")}
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
                    Sign up with Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                    onClick={() => handleOAuthSignUp("github")}
                    disabled={isLoading}
                  >
                    <Github className="w-5 h-5 mr-3" />
                    Sign up with GitHub
                  </Button>
                </div>
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
        </div>
      </div>
    </div>
  );
};

export default Register;
