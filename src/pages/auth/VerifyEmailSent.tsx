import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Mail, ArrowLeft, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import Logo from "@/components/shared/Logo";
import axiosClient from "@/lib/axios-client";
import type { CustomAxiosRequestConfig } from "@/lib/axios-client";

const VerifyEmailSent = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resending, setResending] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleResend = async () => {
    if (!email) return;

    setResending(true);
    try {
      await axiosClient.post(
        "/auth/resend-verification-email",
        { email },
        {
          skipAuth: true,
        } satisfies Partial<CustomAxiosRequestConfig> as CustomAxiosRequestConfig,
      );
      toast.success("Verification email resent!");
    } catch {
      toast.error("Failed to resend verification email. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      <div className="hidden md:flex md:w-[40%] lg:w-[45%] relative bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050B15] via-navy to-royal-blue" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-royal-blue/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10 flex flex-col justify-center p-12 w-full">
          <Logo size="lg" isDark={true} />
          <div className="mt-16">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Almost
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-light to-sky-blue">
                There!
              </span>
            </h2>
            <p className="text-slate-300 text-lg max-w-md">
              Just one more step to start your journey on ConnectMeIndia.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-background relative py-20 lg:py-24">
        <div className="w-full max-w-md px-4 sm:px-0">
          <div className="bg-white dark:bg-white/5 rounded-2xl shadow-xl p-8 sm:p-10 border border-slate-100 dark:border-white/10 text-center">
            <div className="w-20 h-20 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail size={40} className="text-teal" />
            </div>

            <h1 className="text-2xl font-bold text-navy dark:text-white mb-2">
              Check Your Inbox
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-1">
              We sent a verification email to:
            </p>
            <p className="text-base font-semibold text-teal mb-8 break-all">
              {email || "your email"}
            </p>

            {/* Steps */}
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 mb-8 text-left text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal/10 text-teal flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                <span>Open the email and click <strong className="text-teal">Verify Email</strong></span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal/10 text-teal flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                <span>Sign in with your email and password</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal/10 text-teal flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                <span>Start exploring projects and opportunities!</span>
              </p>
            </div>

            {/* Primary action */}
            <Link to="/login">
              <Button className="w-full h-12 bg-teal hover:bg-teal-light text-white font-bold text-base shadow-lg shadow-teal/25">
                Go to Sign In
              </Button>
            </Link>

            {/* Help section */}
            <div className="mt-6 border-t border-slate-100 dark:border-white/10 pt-5">
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors w-full"
              >
                {showHelp ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                Didn&apos;t receive the email?
              </button>

              {showHelp && (
                <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="text-left text-sm text-slate-500 dark:text-slate-400 space-y-2 bg-slate-50 dark:bg-white/5 rounded-lg p-4">
                    <p>Try these steps:</p>
                    <ul className="list-disc list-inside space-y-1 ml-1">
                      <li>Check your spam / junk folder</li>
                      <li>Make sure <strong>{email || "your email"}</strong> is correct</li>
                      <li>Wait a few minutes — emails can be delayed</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleResend}
                    disabled={resending || !email}
                    variant="outline"
                    className="w-full h-11 border-slate-200 dark:border-white/10 text-sm"
                  >
                    {resending ? (
                      <RefreshCw size={16} className="animate-spin mr-2" />
                    ) : (
                      <RefreshCw size={16} className="mr-2" />
                    )}
                    Resend verification email
                  </Button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6">
              <Link
                to="/register"
                className="text-xs text-slate-400 hover:text-navy dark:hover:text-white transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft size={12} />
                Back to Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailSent;
