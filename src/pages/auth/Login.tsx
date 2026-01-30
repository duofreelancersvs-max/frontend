import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to dashboard
    }, 1500);
  };

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
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-navy mb-2">
                Welcome Back
              </h1>
              <p className="text-slate-500">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="pl-11 h-12 bg-slate-50 border-slate-200 focus:border-teal focus:ring-teal"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-700"
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                  "Signing In..."
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
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500">OR</span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
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
            </form>

            {/* Sign Up Link */}
            <p className="text-center mt-8 text-slate-500">
              Don't have an account?{" "}
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
