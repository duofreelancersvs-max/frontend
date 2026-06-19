import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosClient from "@/lib/axios-client";
import { SEO } from "@/components/SEO/SEO";
import AuthPageShell from "@/components/auth/AuthPageShell";

type VerificationStatus = "loading" | "success" | "error";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("");
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        const { data } = await axiosClient.get<{
          data: { verified: boolean; alreadyVerified?: boolean };
        }>("/auth/verify-email", { params: { token } });

        if (cancelled) return;

        if (data.data.verified) {
          const isAlready = data.data.alreadyVerified;
          setStatus("success");
          setMessage(
            isAlready
              ? "Your email is already verified! Redirecting to login..."
              : "Your email has been verified successfully! Redirecting to login...",
          );

          redirectTimerRef.current = setTimeout(() => {
            if (!cancelled) {
              navigate("/login", { state: { emailVerified: true }, replace: true });
            }
          }, 2000);
        } else {
          setStatus("error");
          setMessage("Verification failed. Please try again.");
        }
      } catch (err: any) {
        if (cancelled) return;

        setStatus("error");
        const apiMsg =
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          "Verification link is invalid or has expired.";
        setMessage(apiMsg);
      }
    };

    verify();

    return () => {
      cancelled = true;
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [token, navigate]);

  return (
    <>
      <SEO
        title="Verify Email | ConnectMeIndia"
        description="Verify your ConnectMeIndia account email address to start connecting with clients and freelancers."
        canonical="/verify-email"
      />
      <AuthPageShell
        brandingTitle={
          <>
            Email
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-light to-sky-blue">
              Verification
            </span>
          </>
        }
        brandingDescription="Confirming your email address..."
      >
        <div
          id="main-content"
          className="bg-white dark:bg-white/5 rounded-2xl shadow-xl p-6 sm:p-10 border border-slate-100 dark:border-white/10 text-center"
        >
          {status === "loading" && (
            <>
              <div className="w-20 h-20 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 size={40} className="text-teal animate-spin" aria-hidden />
              </div>
              <h1 className="text-2xl font-bold text-navy dark:text-white mb-2">
                Verifying...
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-600" aria-hidden />
              </div>
              <h1 className="text-2xl font-bold text-navy dark:text-white mb-2">
                Email Verified!
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-8">{message}</p>
              <Link to="/login">
                <Button className="w-full min-h-[44px] h-12 bg-teal hover:bg-teal-light text-white font-bold shadow-lg shadow-teal/25">
                  Sign In
                  <ArrowRight size={18} className="ml-2" aria-hidden />
                </Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle size={40} className="text-red-500" aria-hidden />
              </div>
              <h1 className="text-2xl font-bold text-navy dark:text-white mb-2">
                Verification Failed
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-8">{message}</p>
              <div className="space-y-3">
                <Link to="/login">
                  <Button className="w-full min-h-[44px] h-12 bg-teal hover:bg-teal-light text-white font-bold shadow-lg shadow-teal/25">
                    Go to Sign In
                  </Button>
                </Link>
                <Link
                  to="/register"
                  className="block text-sm text-teal font-medium hover:underline mt-4 min-h-[44px] flex items-center justify-center"
                >
                  Sign up again
                </Link>
              </div>
            </>
          )}
        </div>
      </AuthPageShell>
    </>
  );
};

export default VerifyEmail;
