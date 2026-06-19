import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Mail, ArrowLeft, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import axiosClient from "@/lib/axios-client";
import type { CustomAxiosRequestConfig } from "@/lib/axios-client";
import { formatBackendApiError } from "@/lib/auth-request-errors";
import { SEO } from "@/components/SEO/SEO";
import AuthPageShell from "@/components/auth/AuthPageShell";

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
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? formatBackendApiError(err, "Failed to resend verification email. Please try again.")
        : "Failed to resend verification email. Please try again.";
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <SEO
        title="Check Your Email | ConnectMeIndia"
        description="We sent a verification email. Open it and confirm your address to activate your ConnectMeIndia account."
        canonical="/verify-email-sent"
      />
      <AuthPageShell
        brandingTitle={
          <>
            Almost
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-light to-sky-blue">
              There!
            </span>
          </>
        }
        brandingDescription="Just one more step to start your journey on ConnectMeIndia."
      >
        <div
          id="main-content"
          className="bg-white dark:bg-white/5 rounded-2xl shadow-xl p-6 sm:p-10 border border-slate-100 dark:border-white/10 text-center"
        >
          <div className="w-20 h-20 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={40} className="text-teal" aria-hidden />
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

          <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 mb-8 text-left text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-teal/10 text-teal flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </span>
              <span>
                Open the email and click <strong className="text-teal">Verify Email</strong>
              </span>
            </p>
            <p className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-teal/10 text-teal flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </span>
              <span>Sign in with your email and password</span>
            </p>
            <p className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-teal/10 text-teal flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </span>
              <span>Start exploring projects and opportunities!</span>
            </p>
          </div>

          <Link to="/login">
            <Button className="w-full min-h-[44px] h-12 bg-teal hover:bg-teal-light text-white font-bold text-base shadow-lg shadow-teal/25">
              Go to Sign In
            </Button>
          </Link>

          <div className="mt-6 border-t border-slate-100 dark:border-white/10 pt-5">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              aria-expanded={showHelp}
              className="flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors w-full min-h-[44px]"
            >
              {showHelp ? <ChevronUp size={16} aria-hidden /> : <ChevronDown size={16} aria-hidden />}
              Didn&apos;t receive the email?
            </button>

            {showHelp && (
              <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="text-left text-sm text-slate-500 dark:text-slate-400 space-y-2 bg-slate-50 dark:bg-white/5 rounded-lg p-4">
                  <p>Try these steps:</p>
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    <li>Check your spam / junk folder</li>
                    <li>
                      Make sure <strong>{email || "your email"}</strong> is correct
                    </li>
                    <li>Wait a few minutes — emails can be delayed</li>
                  </ul>
                </div>

                <Button
                  onClick={handleResend}
                  disabled={resending || !email}
                  variant="outline"
                  className="w-full min-h-[44px] h-11 border-slate-200 dark:border-white/10 text-sm"
                >
                  {resending ? (
                    <RefreshCw size={16} className="animate-spin mr-2" aria-hidden />
                  ) : (
                    <RefreshCw size={16} className="mr-2" aria-hidden />
                  )}
                  Resend verification email
                </Button>
              </div>
            )}
          </div>

          <div className="mt-6">
            <Link
              to="/register"
              className="text-xs text-slate-400 hover:text-navy dark:hover:text-white transition-colors flex items-center justify-center gap-1 min-h-[44px]"
            >
              <ArrowLeft size={12} aria-hidden />
              Back to Sign Up
            </Link>
          </div>
        </div>
      </AuthPageShell>
    </>
  );
};

export default VerifyEmailSent;
