import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle, KeyRound, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/shared/Logo";
import { toast } from "react-toastify";
import { TurnstileWidget } from "@/components/common/TurnstileWidget";
import { SEO } from "@/components/SEO/SEO";
import AuthFormPanel from "@/components/auth/AuthFormPanel";
import { isInAppBrowser } from "@/lib/oauth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [inAppBrowserDetected] = useState(() => isInAppBrowser());
  const { resetPassword, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      toast.error("Please complete the security challenge");
      return;
    }
    try {
      await resetPassword(email, turnstileToken);
      setIsSubmitted(true);
    } catch {
      // Error is handled in the hook
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      <SEO
        title="Reset Password | ConnectMeIndia"
        description="Reset your ConnectMeIndia account password. We'll send you a secure link to create a new password."
        canonical="/forgot-password"
      />
      {/* LEFT SIDE - Branding */}
      <div className="hidden md:flex md:w-[40%] lg:w-[45%] relative bg-navy overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050B15] via-navy to-royal-blue" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-royal-blue/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
        <div className="absolute inset-0 bg-gradient-to-br from-navy/20 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo isDark size="lg" />

          {/* Center Content */}
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal to-teal-light flex items-center justify-center mb-8">
              <KeyRound size={64} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Forgot Your Password?
            </h2>
            <p className="text-slate-300 text-lg max-w-md">
              Don&apos;t worry, it happens to the best of us. We&apos;ll help
              you reset it in no time.
            </p>
          </div>

          {/* Help Note */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
            <p className="text-white/90 text-sm">
              Need help? Contact our support team at{" "}
              <a
                href="mailto:support@connectmeindia.in"
                className="text-teal-light hover:underline"
              >
                support@connectmeindia.in
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Form (mobile-first) */}
      <AuthFormPanel>
          {/* Form Card */}
          <div className="bg-white dark:bg-white/5 rounded-2xl shadow-xl p-5 sm:p-8 border border-slate-100 dark:border-white/10">
            {/* Back Button */}
            <Link
              to="/login"
              className="flex items-center gap-2 text-slate-500 hover:text-navy mb-6 transition-colors min-h-[44px]"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Back to Login</span>
            </Link>

            {!isSubmitted ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-royal-blue/10 flex items-center justify-center mx-auto mb-4">
                    <KeyRound size={32} className="text-royal-blue" />
                  </div>
                  <h1 className="text-2xl font-bold text-navy mb-2">
                    Reset Password
                  </h1>
                  <p className="text-slate-500">
                    Enter your email address and we&apos;ll send you
                    instructions to reset your password.
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
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-semibold text-slate-700"
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
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) clearError();
                        }}
                        placeholder="Enter your Email"
                        className="pl-11 h-12 bg-slate-50 border-slate-200 focus:border-teal focus:ring-teal"
                        required
                        disabled={isLoading}
                      />
                    </div>
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
                        Sending...
                      </span>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>

                {/* Remember Password */}
                <p className="text-center mt-6 text-slate-500 text-sm">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="text-teal font-semibold hover:underline"
                  >
                    Sign In
                  </Link>
                </p>
              </>
            ) : (
              /* Success State */
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={48} className="text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-navy mb-2">
                  Check Your Email
                </h1>
                <p className="text-slate-500 mb-6">
                  We&apos;ve sent password reset instructions to
                  <br />
                  <span className="font-semibold text-navy">{email}</span>
                </p>
                <p className="text-sm text-slate-400 mb-6">
                  Didn&apos;t receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                    }}
                    className="text-teal hover:underline"
                  >
                    try again
                  </button>
                </p>
                <Link to="/login">
                  <Button variant="outline" className="border-slate-200">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
      </AuthFormPanel>
    </div>
  );
};

export default ForgotPassword;
