import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type UserRole = "client" | "freelancer" | null;
type Step = "role" | "form";

const Register = () => {
  const [step, setStep] = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [clientForm, setClientForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [freelancerForm, setFreelancerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    primarySkill: "Video Editing",
    password: "",
    confirmPassword: "",
  });

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFreelancerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFreelancerForm((prev) => ({ ...prev, [name]: value }));
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to OTP verification
      window.location.href = "/verify-otp";
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
              Join Our
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-light to-sky-blue">
                Community
              </span>
            </h2>
            <p className="text-slate-300 text-lg max-w-md mb-8">
              {selectedRole === "client"
                ? "Find the perfect creative talent for your projects."
                : selectedRole === "freelancer"
                  ? "Showcase your skills and connect with clients."
                  : "Choose your path and start your journey with us."}
            </p>

            {/* Benefits */}
            <div className="space-y-4">
              {(selectedRole === "client"
                ? [
                    "Access to 500+ verified freelancers",
                    "Secure payment protection",
                    "Post unlimited projects",
                  ]
                : selectedRole === "freelancer"
                  ? [
                      "Get discovered by top clients",
                      "Secure milestone payments",
                      "Build your portfolio",
                    ]
                  : [
                      "500+ verified professionals",
                      "Secure platform",
                      "24/7 support",
                    ]
              ).map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-white/80"
                >
                  <CheckCircle size={18} className="text-teal-light" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <Quote size={24} className="text-teal-light mb-3" />
            <p className="text-white/90 italic mb-4">
              {selectedRole === "freelancer"
                ? "I've doubled my income since joining ConnectMeIndia. The platform brings quality clients directly to me!"
                : "Finding reliable creative talent has never been easier. ConnectMeIndia is a game-changer!"}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white font-bold text-sm">
                {selectedRole === "freelancer" ? "PS" : "RK"}
              </div>
              <div>
                <div className="text-white font-semibold">
                  {selectedRole === "freelancer"
                    ? "Priya Sharma"
                    : "Rahul Kumar"}
                </div>
                <div className="text-white/60 text-sm">
                  {selectedRole === "freelancer"
                    ? "Video Editor"
                    : "Founder, MediaWorks"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-lg">
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
            {/* STEP 1: Role Selection */}
            {step === "role" && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-navy mb-2">
                    Join Our Community
                  </h1>
                  <p className="text-slate-500">I want to:</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {/* Client Card */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("client")}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all duration-300 text-left group",
                      selectedRole === "client"
                        ? "border-teal bg-teal/5 shadow-lg"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                    )}
                  >
                    <div
                      className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
                        selectedRole === "client"
                          ? "bg-teal text-white"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200",
                      )}
                    >
                      <Briefcase size={28} />
                    </div>
                    <h3
                      className={cn(
                        "font-bold text-lg mb-1",
                        selectedRole === "client" ? "text-teal" : "text-navy",
                      )}
                    >
                      Hire Talent
                    </h3>
                    <p className="text-slate-500 text-sm">
                      Post projects and find freelancers
                    </p>
                  </button>

                  {/* Freelancer Card */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("freelancer")}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all duration-300 text-left group",
                      selectedRole === "freelancer"
                        ? "border-teal bg-teal/5 shadow-lg"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                    )}
                  >
                    <div
                      className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
                        selectedRole === "freelancer"
                          ? "bg-teal text-white"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200",
                      )}
                    >
                      <User size={28} />
                    </div>
                    <h3
                      className={cn(
                        "font-bold text-lg mb-1",
                        selectedRole === "freelancer"
                          ? "text-teal"
                          : "text-navy",
                      )}
                    >
                      Find Work
                    </h3>
                    <p className="text-slate-500 text-sm">
                      Showcase skills and get hired
                    </p>
                  </button>
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={!selectedRole}
                  className="w-full h-12 bg-teal hover:bg-teal-light text-white font-bold text-base shadow-lg shadow-teal/25 disabled:opacity-50"
                >
                  Continue
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </>
            )}

            {/* STEP 2: Registration Form */}
            {step === "form" && (
              <>
                {/* Back Button */}
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-slate-500 hover:text-navy mb-6 transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span className="text-sm font-medium">Back</span>
                </button>

                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-navy mb-2">
                    Create {selectedRole === "client" ? "Client" : "Freelancer"}{" "}
                    Account
                  </h1>
                  <p className="text-slate-500">
                    Fill in your details to get started
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* CLIENT FORM */}
                  {selectedRole === "client" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Full Name
                        </label>
                        <div className="relative">
                          <User
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                          />
                          <Input
                            name="fullName"
                            value={clientForm.fullName}
                            onChange={handleClientChange}
                            placeholder="John Doe"
                            className="pl-11 h-11 bg-slate-50 border-slate-200"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Company Name{" "}
                          <span className="text-slate-400 font-normal">
                            (optional)
                          </span>
                        </label>
                        <div className="relative">
                          <Building
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                          />
                          <Input
                            name="companyName"
                            value={clientForm.companyName}
                            onChange={handleClientChange}
                            placeholder="Your Company"
                            className="pl-11 h-11 bg-slate-50 border-slate-200"
                          />
                        </div>
                      </div>

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
                            value={clientForm.email}
                            onChange={handleClientChange}
                            placeholder="john@company.com"
                            className="pl-11 h-11 bg-slate-50 border-slate-200"
                            required
                          />
                        </div>
                      </div>

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
                            value={clientForm.phone}
                            onChange={handleClientChange}
                            placeholder="+91 98765 43210"
                            className="pl-11 h-11 bg-slate-50 border-slate-200"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
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
                              value={clientForm.password}
                              onChange={handleClientChange}
                              placeholder="••••••••"
                              className="pl-11 pr-11 h-11 bg-slate-50 border-slate-200"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            >
                              {showPassword ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Confirm
                          </label>
                          <div className="relative">
                            <Lock
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                              size={18}
                            />
                            <Input
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={clientForm.confirmPassword}
                              onChange={handleClientChange}
                              placeholder="••••••••"
                              className="pl-11 pr-11 h-11 bg-slate-50 border-slate-200"
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            >
                              {showConfirmPassword ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* FREELANCER FORM */}
                  {selectedRole === "freelancer" && (
                    <>
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
                              value={freelancerForm.firstName}
                              onChange={handleFreelancerChange}
                              placeholder="John"
                              className="pl-11 h-11 bg-slate-50 border-slate-200"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Last Name
                          </label>
                          <Input
                            name="lastName"
                            value={freelancerForm.lastName}
                            onChange={handleFreelancerChange}
                            placeholder="Doe"
                            className="h-11 bg-slate-50 border-slate-200"
                            required
                          />
                        </div>
                      </div>

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
                            value={freelancerForm.email}
                            onChange={handleFreelancerChange}
                            placeholder="john@example.com"
                            className="pl-11 h-11 bg-slate-50 border-slate-200"
                            required
                          />
                        </div>
                      </div>

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
                            value={freelancerForm.phone}
                            onChange={handleFreelancerChange}
                            placeholder="+91 98765 43210"
                            className="pl-11 h-11 bg-slate-50 border-slate-200"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Primary Skill Category
                        </label>
                        <select
                          name="primarySkill"
                          value={freelancerForm.primarySkill}
                          onChange={handleFreelancerChange}
                          className="flex h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
                        >
                          <option value="Video Editing">Video Editing</option>
                          <option value="VFX & Motion Graphics">
                            VFX & Motion Graphics
                          </option>
                          <option value="3D Design & Animation">
                            3D Design & Animation
                          </option>
                          <option value="Color Grading">Color Grading</option>
                          <option value="Sound Design">Sound Design</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
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
                              value={freelancerForm.password}
                              onChange={handleFreelancerChange}
                              placeholder="••••••••"
                              className="pl-11 pr-11 h-11 bg-slate-50 border-slate-200"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            >
                              {showPassword ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Confirm
                          </label>
                          <div className="relative">
                            <Lock
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                              size={18}
                            />
                            <Input
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={freelancerForm.confirmPassword}
                              onChange={handleFreelancerChange}
                              placeholder="••••••••"
                              className="pl-11 pr-11 h-11 bg-slate-50 border-slate-200"
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            >
                              {showConfirmPassword ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Terms Checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-teal focus:ring-teal mt-0.5"
                      required
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
                      "Creating Account..."
                    ) : (
                      <>
                        Create Account
                        <ArrowRight size={18} className="ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}

            {/* Sign In Link */}
            <p className="text-center mt-6 text-slate-500">
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
