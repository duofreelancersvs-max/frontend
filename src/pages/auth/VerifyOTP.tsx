import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }

    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleResend = () => {
    if (!canResend) return;
    setResendTimer(30);
    setCanResend(false);
    // Simulate resend OTP
  };

  const handleVerify = () => {
    if (otp.some((digit) => !digit)) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsVerified(true);
      // Redirect after success
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }, 1500);
  };

  const maskedPhone = "+91 XXXXXX1234";

  return (
    <div className="min-h-screen flex font-sans">
      {/* LEFT SIDE - Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-navy overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-[#0f2445] to-royal-blue" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-royal-blue/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center text-white font-bold text-xl shadow-lg">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-tight">
                ConnectMe
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase -mt-1 text-teal-light">
                India
              </span>
            </div>
          </Link>

          {/* Center Content */}
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal to-teal-light flex items-center justify-center mb-8">
              <Smartphone size={64} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Almost There!
            </h2>
            <p className="text-slate-300 text-lg max-w-md">
              We've sent a verification code to your phone. Enter it to complete
              your registration.
            </p>
          </div>

          {/* Security Note */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
            <div className="flex items-center justify-center gap-2 text-teal-light mb-2">
              <CheckCircle size={20} />
              <span className="font-semibold">Secure Verification</span>
            </div>
            <p className="text-white/70 text-sm">
              Your phone number helps us keep your account secure and enables
              important notifications.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - OTP Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy to-royal-blue flex items-center justify-center text-white font-bold text-lg shadow-lg">
                C
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-navy tracking-tight">
                  ConnectMe
                </span>
                <span className="text-[10px] font-semibold tracking-widest uppercase -mt-1 text-teal">
                  India
                </span>
              </div>
            </Link>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            {/* Back Button */}
            <Link
              to="/register"
              className="flex items-center gap-2 text-slate-500 hover:text-navy mb-6 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Back</span>
            </Link>

            {!isVerified ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
                    <Smartphone size={32} className="text-teal" />
                  </div>
                  <h1 className="text-2xl font-bold text-navy mb-2">
                    Verify Your Phone
                  </h1>
                  <p className="text-slate-500">
                    Enter the 6-digit code sent to
                    <br />
                    <span className="font-semibold text-navy">
                      {maskedPhone}
                    </span>
                  </p>
                </div>

                {/* OTP Inputs */}
                <div className="flex justify-center gap-3 mb-8">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handleChange(index, e.target.value.replace(/\D/g, ""))
                      }
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className={cn(
                        "w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all",
                        "focus:outline-none focus:border-teal focus:ring-4 focus:ring-teal/20",
                        digit
                          ? "border-teal bg-teal/5 text-navy"
                          : "border-slate-200 bg-slate-50 text-slate-400",
                      )}
                    />
                  ))}
                </div>

                {/* Verify Button */}
                <Button
                  onClick={handleVerify}
                  disabled={otp.some((digit) => !digit) || isLoading}
                  className="w-full h-12 bg-teal hover:bg-teal-light text-white font-bold text-base shadow-lg shadow-teal/25 disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>

                {/* Resend */}
                <div className="text-center mt-6">
                  <p className="text-slate-500 text-sm">
                    Didn't receive code?{" "}
                    {canResend ? (
                      <button
                        onClick={handleResend}
                        className="text-teal font-semibold hover:underline"
                      >
                        Resend
                      </button>
                    ) : (
                      <span className="text-slate-400">
                        Resend in {resendTimer}s
                      </span>
                    )}
                  </p>
                </div>

                {/* Change Phone */}
                <div className="text-center mt-4">
                  <Link
                    to="/register"
                    className="text-sm text-slate-500 hover:text-navy"
                  >
                    Change phone number
                  </Link>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={48} className="text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-navy mb-2">Verified!</h1>
                <p className="text-slate-500 mb-6">
                  Your phone number has been verified successfully.
                </p>
                <p className="text-sm text-slate-400">
                  Redirecting to dashboard...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
