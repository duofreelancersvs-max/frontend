import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/shared/Logo";
import axiosClient from "@/lib/axios-client";

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
    <div className="min-h-screen flex font-sans">
      <div className="hidden md:flex md:w-[40%] lg:w-[45%] relative bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050B15] via-navy to-royal-blue" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-royal-blue/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10 flex flex-col justify-center p-12 w-full">
          <Logo size="lg" isDark={true} />
          <div className="mt-16">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Email
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-light to-sky-blue">
                Verification
              </span>
            </h2>
            <p className="text-slate-300 text-lg max-w-md">
              Confirming your email address...
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-background relative py-20 lg:py-24">
        <div className="w-full max-w-md px-4 sm:px-0">
          <div className="bg-white dark:bg-white/5 rounded-2xl shadow-xl p-8 sm:p-10 border border-slate-100 dark:border-white/10 text-center">
            {status === "loading" && (
              <>
                <div className="w-20 h-20 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 size={40} className="text-teal animate-spin" />
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
                  <CheckCircle size={40} className="text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-navy dark:text-white mb-2">
                  Email Verified!
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                  {message}
                </p>
                <Link to="/login">
                  <Button className="w-full h-12 bg-teal hover:bg-teal-light text-white font-bold shadow-lg shadow-teal/25">
                    Sign In
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle size={40} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-navy dark:text-white mb-2">
                  Verification Failed
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                  {message}
                </p>
                <div className="space-y-3">
                  <Link to="/login">
                    <Button className="w-full h-12 bg-teal hover:bg-teal-light text-white font-bold shadow-lg shadow-teal/25">
                      Go to Sign In
                    </Button>
                  </Link>
                  <Link
                    to="/register"
                    className="block text-sm text-teal font-medium hover:underline mt-4"
                  >
                    Sign up again
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
