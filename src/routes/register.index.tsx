import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, Upload, User, Eye, EyeOff, Mail, Lock, Phone, Clock, MapPin, Globe, Instagram, Facebook, Youtube, Linkedin, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { calculateAge } from "@/lib/utils";
import {
  Select as RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTransition } from "@/components/wag/primitives";
import loginVideo from "@/assets/login.mp4";
import bhoiLogo from "@/assets/Bhoi.png";

export const Route = createFileRoute("/register/")({
  head: () => ({ meta: [{ title: "Register — BHOI" }] }),
  component: Register,
});

const STEPS = ["Personal", "Location", "Education", "Profession", "Community", "Verify"];

function Register() {
  const [step, setStep] = useState(() => {
    if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
      const saved = sessionStorage.getItem("reg_member_step");
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [dir, setDir] = useState(1);
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [communitiesList, setCommunitiesList] = useState<any[]>([]);
  const navigate = useNavigate();

  // Focus states to make the visual art react to inputs!
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  useEffect(() => {
    api.getCommunities().then(res => {
      if (res && res.length > 0) {
        setCommunitiesList(res);
        setFormData((prev: any) => {
          if (!prev.communityId) {
            return {
              ...prev,
              communityId: res[0].id.toString(),
              communityName: res[0].name,
              cState: res[0].state,
              cDistrict: res[0].district,
              cTaluka: res[0].taluka
            };
          }
          return prev;
        });
      }
    }).catch(e => {
      console.warn("Failed to load communities dynamically", e);
    });
  }, []);

  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
      const saved = sessionStorage.getItem("reg_member_draft");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) { }
      }
    }
    return {
      photo: "", fullName: "", dob: "", gender: "Male", mobile: "", email: "", password: "",
      country: "India", state: "Gujarat", district: "Amreli", taluka: "Rajula", village: "Rampara", address: "",
      school: "", college: "", degree: "", fieldOfStudy: "", passingYear: "",
      professionType: "Job", jobTitle: "", jobType: "", jobTypeOther: "", company: "", industry: "", salary: "",
      jobWorkMode: "On-site", jobCity: "", jobState: "", jobCountry: "India", jobAddress: "",
      businessName: "", businessCategory: "", gstNo: "", businessYears: "",
      businessDesc: "", businessPhone: "", businessWhatsapp: "", businessEmail: "", businessWebsite: "",
      businessAddress: "", businessCity: "", businessState: "", businessPincode: "",
      businessHours: {
        Monday: "09:00 AM - 07:00 PM", Tuesday: "09:00 AM - 07:00 PM",
        Wednesday: "09:00 AM - 07:00 PM", Thursday: "09:00 AM - 07:00 PM",
        Friday: "09:00 AM - 07:00 PM", Saturday: "09:00 AM - 05:00 PM",
        Sunday: "Closed"
      },
      businessInstagram: "", businessFacebook: "", businessYoutube: "", businessLinkedin: "",
      cState: "Gujarat", cDistrict: "Amreli", cTaluka: "Rajula", communityName: "Rampara Ahir Samaj", communityId: "",
      aadhaarNo: "", aadhaarPhoto: ""
    };
  });

  useEffect(() => {
    if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("reg_member_draft", JSON.stringify(formData));
    }
  }, [formData]);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("reg_member_step", step.toString());
    }
  }, [step]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let isUnloading = false;
    const handleUnload = () => { isUnloading = true; };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      if (!isUnloading && typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem("reg_member_draft");
        sessionStorage.removeItem("reg_member_step");
      }
    };
  }, []);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const updateField = (key: string, val: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: val }));
  };

  const [verificationPending, setVerificationPending] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }
    setIsVerifyingOtp(true);
    try {
      await api.registerVerifyOTP(formData.email, otp);
      toast.success("Email verified successfully!");
      sessionStorage.removeItem("reg_member_draft");
      sessionStorage.removeItem("reg_member_step");
      setVerificationPending(false);
      setDone(true);
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await api.registerSendOTP(formData.email);
      toast.success("A new 6-digit OTP has been sent to your email.");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend OTP.");
    }
  };

  const next = async () => {
    if (step === 0) {
      if (!formData.photo) return toast.error("Profile photo is required.");
      if (!formData.fullName.trim()) return toast.error("Full Name is required.");
      if (!/^[a-zA-Z\s]{3,100}$/.test(formData.fullName.trim())) {
        return toast.error("Full Name must be between 3 and 100 characters and contain only letters and spaces.");
      }
      if (!formData.dob) return toast.error("Date of Birth is required.");
      const birthDate = new Date(formData.dob);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (birthDate > today) return toast.error("Birthdate cannot be in the future.");

      const calculatedAgeStr = calculateAge(formData.dob);
      const calculatedAge = calculatedAgeStr ? parseInt(calculatedAgeStr, 10) : 0;
      if (calculatedAge < 18) return toast.error("You must be at least 18 years old to register.");

      if (!formData.gender) return toast.error("Gender is required.");

      if (!formData.mobile.trim()) return toast.error("Mobile number is required.");
      if (!/^\d{10}$/.test(formData.mobile.trim())) {
        return toast.error("Mobile number must be exactly 10 digits.");
      }
      if (!formData.email.trim()) return toast.error("Email address is required.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        return toast.error("Please enter a valid email address.");
      }
      if (!formData.password.trim()) return toast.error("Password is required.");
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        return toast.error("Password must be at least 8 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character.");
      }
    }

    if (step === 1) {
      if (!formData.country) return toast.error("Country is required.");
      if (!formData.state) return toast.error("State is required.");
      if (!formData.district) return toast.error("District is required.");
      if (!formData.taluka) return toast.error("Taluka is required.");
      if (!formData.village) return toast.error("Village is required.");
      if (!formData.address || formData.address.trim().length < 10) {
        return toast.error("Address must be at least 10 characters long.");
      }
    }

    if (step === 2) {
      if (!formData.school || !formData.school.trim()) return toast.error("School is required.");
      if (!formData.degree || !formData.degree.trim()) return toast.error("Degree is required.");
      if (!formData.fieldOfStudy || !formData.fieldOfStudy.trim()) return toast.error("Field of Study is required.");
      if (!formData.passingYear) return toast.error("Passing Year is required.");
      const currentYear = new Date().getFullYear();
      if (parseInt(formData.passingYear, 10) > currentYear) {
        return toast.error("Passing Year cannot be in the future.");
      }
    }

    if (step === 3) {
      if (!formData.professionType) return toast.error("Profession Type is required.");
      if (formData.professionType === "Job") {
        if (!formData.jobTitle || !formData.jobTitle.trim()) return toast.error("Job Title is required.");
        if (!formData.company || !formData.company.trim()) return toast.error("Company is required.");
        if (!formData.industry || !formData.industry.trim()) return toast.error("Industry is required.");
        if (!formData.salary || parseFloat(formData.salary) <= 0) {
          return toast.error("Annual Salary (LPA) must be a positive number.");
        }
      } else {
        if (!formData.businessName || !formData.businessName.trim()) return toast.error("Business Name is required.");
        if (!formData.businessCategory || !formData.businessCategory.trim()) return toast.error("Business Category is required.");
        if (!formData.businessYears) return toast.error("Years in Business is required.");
        const age = calculateAge(formData.dob) ? parseInt(calculateAge(formData.dob)!, 10) : 0;
        if (parseInt(formData.businessYears, 10) > age) {
          return toast.error("Years in Business cannot exceed your age.");
        }
        if (parseInt(formData.businessYears, 10) < 0) {
          return toast.error("Years in Business cannot be negative.");
        }
      }
    }

    if (step === 4) {
      if (!formData.communityId) return toast.error("Please select a community.");
    }

    if (step < STEPS.length - 1) {
      setDir(1);
      setStep(step + 1);
    } else {
      if (!formData.aadhaarNo || !formData.aadhaarNo.trim()) return toast.error("Aadhaar Number is mandatory to complete verification.");
      const cleanAadhaar = formData.aadhaarNo.replace(/[^0-9]/g, "");
      if (cleanAadhaar.length !== 12) return toast.error("Aadhaar Number must be exactly 12 digits.");
      if (!formData.aadhaarPhoto) return toast.error("Please upload your Aadhaar card photo.");

      setIsSubmitting(true);
      try {
        let age = 25;
        if (formData.dob) {
          const calculatedAge = calculateAge(formData.dob);
          age = calculatedAge ? parseInt(calculatedAge, 10) : 25;
        }

        const cleanName = formData.fullName.toLowerCase().replace(/[^a-z0-9]/g, "");
        const username = `${cleanName || "user"}_${Math.floor(100 + Math.random() * 900)}`;

        const fd = new FormData();
        fd.append("username", username);
        fd.append("password", formData.password || "User123!");
        fd.append("email", formData.email || `${username}@example.com`);
        fd.append("name", formData.fullName);
        fd.append("phone", formData.mobile);
        fd.append("gender", formData.gender);
        fd.append("age", String(age));
        fd.append("state", formData.state);
        fd.append("district", formData.district);
        fd.append("taluka", formData.taluka);
        fd.append("village", formData.village || "Rampara");
        fd.append("profession", formData.professionType === "Job" ? formData.jobTitle : formData.businessName);
        fd.append("education", formData.degree || "Graduate");
        fd.append("school", formData.school || "");
        fd.append("college", formData.college || "");
        fd.append("degree", formData.degree || "");
        fd.append("fieldOfStudy", formData.fieldOfStudy || "");
        fd.append("passingYear", formData.passingYear || "");
        fd.append("professionType", formData.professionType);
        fd.append("jobTitle", formData.jobTitle || "");
        fd.append("jobType", formData.jobType === "Other" ? (formData.jobTypeOther || "") : (formData.jobType || ""));
        fd.append("company", formData.company || "");
        fd.append("industry", formData.industry || "");
        fd.append("salary", formData.salary || "");
        fd.append("jobWorkMode", formData.jobWorkMode || "");
        fd.append("jobCity", formData.jobCity || "");
        fd.append("jobState", formData.jobState || "");
        fd.append("jobCountry", formData.jobCountry || "");
        fd.append("jobAddress", formData.jobAddress || "");
        fd.append("businessName", formData.businessName || "");
        fd.append("businessCategory", formData.businessCategory || "");
        fd.append("gstNo", formData.gstNo || "");
        fd.append("businessYears", formData.businessYears || "");
        fd.append("businessDesc", formData.businessDesc || "");
        fd.append("businessPhone", formData.businessPhone || "");
        fd.append("businessWhatsapp", formData.businessWhatsapp || "");
        fd.append("businessEmail", formData.businessEmail || "");
        fd.append("businessWebsite", formData.businessWebsite || "");
        fd.append("businessAddress", formData.businessAddress || "");
        fd.append("businessCity", formData.businessCity || "");
        fd.append("businessState", formData.businessState || "");
        fd.append("businessPincode", formData.businessPincode || "");
        fd.append("businessHours", JSON.stringify(formData.businessHours));
        fd.append("businessInstagram", formData.businessInstagram || "");
        fd.append("businessFacebook", formData.businessFacebook || "");
        fd.append("businessYoutube", formData.businessYoutube || "");
        fd.append("businessLinkedin", formData.businessLinkedin || "");
        fd.append("communityId", String(parseInt(formData.communityId, 10) || 1));
        fd.append("role", "member");
        fd.append("aadhaar", formData.aadhaarNo);

        if (avatarFile) fd.append("avatar", avatarFile);
        if (aadhaarFile) fd.append("aadhaar_photo", aadhaarFile);
        if (logoFile) fd.append("business_logo", logoFile);

        galleryFiles.forEach((file, idx) => {
          fd.append(`business_gallery_${idx}`, file);
        });

        await api.register(fd);
        setVerificationPending(true);
      } catch (err: any) {
        console.error("Member registration failed: ", err);
        toast.error(err.message || "Registration failed. Please make sure the email is unique and backend is running.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const back = () => {
    setDir(-1);
    setStep(s => Math.max(0, s - 1));
  };

  if (verificationPending) {
    return (
      <div className="min-h-screen bg-[#FCF5EC] flex items-center justify-center px-6 font-sans">
        <div className="bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(238,150,80,0.12)] p-10 max-w-md w-full border border-orange-200/50 text-center relative rounded-[32px]">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C1D12] mb-2">Verify Your Email</h2>
          <p className="text-[#7A6455] text-xs sm:text-sm font-semibold mb-6">
            We have sent a 6-digit OTP code to verify your identity.
          </p>

          <form onSubmit={handleVerifyOtp} className="space-y-6 text-left">
            <div>
              <label className="text-[11px] font-bold text-[#EA580C] uppercase tracking-wider block mb-2">
                Registered Email
              </label>
              <input
                type="text"
                readOnly
                value={formData.email}
                className="w-full px-4 py-3 rounded-2xl border border-orange-200/50 bg-orange-50/30 font-semibold text-stone-500 text-sm shadow-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#EA580C] uppercase tracking-wider block mb-2">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 rounded-2xl border border-orange-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white font-bold text-stone-800 text-center text-lg tracking-[0.5em] shadow-sm outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifyingOtp}
              className="relative w-full py-3.5 mt-8 rounded-full bg-gradient-to-r from-[#F25C05] to-[#FFA74D] hover:from-[#E14D02] hover:to-[#FF952B] hover:shadow-[0_12px_40px_rgba(242,92,5,0.45)] focus:outline-none text-white font-extrabold text-[15px] tracking-wide shadow-[0_8px_30px_rgba(242,92,5,0.3)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-75"
            >
              {isVerifyingOtp ? "Verifying..." : "Verify & Activate Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-xs font-bold text-[#EA580C] hover:underline"
            >
              Resend OTP Code
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (done) return <Success data={formData} onClose={() => navigate({ to: "/login" })} />;

  return (
    <PageTransition>
      <div className="relative min-h-[100dvh] w-full text-white font-sans flex flex-col justify-between overflow-x-hidden selection:bg-orange-500 selection:text-white">
        {/* Background Video */}
        <video
          src={loginVideo}
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none scale-105"
        />

        {/* Video Overlay with ambient backdrop blur */}
        <div className="fixed inset-0 bg-gradient-to-tr from-black/95 via-black/80 to-[#1C0E06]/90 backdrop-blur-[2px] z-[1] pointer-events-none" />

        {/* TOP HEADER */}
        <header className="w-full max-w-7xl mx-auto px-6 pt-6 pb-2 z-20 flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex flex-col items-start gap-1 group">
              <img src={bhoiLogo} alt="BHOI Logo" className="h-16 w-auto object-contain drop-shadow-md group-hover:scale-[1.02] transition-transform" />
              <span className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider leading-none">
                Connect. Empower. Grow.
              </span>
            </Link>
          </div>

          <Link
            to="/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all backdrop-blur-md shadow-lg active:scale-95"
          >
            Already have an account? Sign In
          </Link>
        </header>

        {/* MAIN BODY: SPLIT VIEW LAYOUT */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 z-10 flex flex-col justify-center relative">
          <div className="grid lg:grid-cols-12 gap-8 xl:gap-12 items-center w-full">

            {/* LEFT COLUMN: FLOATING FIELDS */}
            <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center w-full">
              {/* Stepper Progress Bar */}
              <div className="mb-6">
                <div className="grid grid-cols-6 gap-2 relative">
                  {STEPS.map((s, i) => {
                    const isActive = step === i;
                    const isPast = step > i;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => isPast && setStep(i)}
                        disabled={!isPast}
                        className={`flex flex-col items-center text-center transition-all ${isPast ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
                      >
                        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-extrabold text-xs transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-[#F25C05] to-[#FFA74D] text-white shadow-lg shadow-orange-500/40 ring-4 ring-orange-500/20 scale-105'
                            : isPast
                              ? 'bg-orange-500 text-white font-bold'
                              : 'bg-white/10 text-white/40 border border-white/15'
                        }`}>
                          {isPast ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                        </div>
                        <span className={`text-[10px] font-bold mt-2 truncate w-full ${
                          isActive ? 'text-orange-400 font-extrabold' : isPast ? 'text-white/80' : 'text-white/40'
                        }`}>
                          {s}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step Title Header */}
              <div className="mb-6">
                <span className="text-orange-400 text-[11px] font-extrabold tracking-widest uppercase block">
                  Step {step + 1} of {STEPS.length}
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-white font-bold mt-1 drop-shadow-sm">
                  {STEPS[step]} Information
                </h2>
              </div>

              {/* Form Content */}
              <div className="w-full">
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={step}
                    custom={dir}
                    initial={{ x: dir > 0 ? 20 : -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: dir > 0 ? -20 : 20, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="space-y-5"
                  >
                    {step === 0 && (
                      <Personal
                        data={formData}
                        onChange={updateField}
                        setIsEmailFocused={setIsEmailFocused}
                        setIsPasswordFocused={setIsPasswordFocused}
                        avatarFile={avatarFile}
                        setAvatarFile={setAvatarFile}
                      />
                    )}
                    {step === 1 && <LocationStep data={formData} onChange={updateField} />}
                    {step === 2 && <Education data={formData} onChange={updateField} />}
                    {step === 3 && (
                      <Profession
                        data={formData}
                        onChange={updateField}
                        logoFile={logoFile}
                        setLogoFile={setLogoFile}
                        galleryFiles={galleryFiles}
                        setGalleryFiles={setGalleryFiles}
                        galleryPreviews={galleryPreviews}
                        setGalleryPreviews={setGalleryPreviews}
                      />
                    )}
                    {step === 4 && <Community data={formData} onChange={updateField} communities={communitiesList} />}
                    {step === 5 && (
                      <Verify
                        data={formData}
                        onChange={updateField}
                        aadhaarFile={aadhaarFile}
                        setAadhaarFile={setAadhaarFile}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* ACTION BUTTONS */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/15">
                  <button
                    type="button"
                    onClick={back}
                    disabled={step === 0 || isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all backdrop-blur-md shadow-sm active:scale-95 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-orange-400" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    disabled={isSubmitting}
                    className="relative px-9 py-3 rounded-full bg-gradient-to-r from-[#F25C05] to-[#FFA74D] hover:from-[#E14D02] hover:to-[#FF952B] focus:outline-none text-white font-extrabold text-sm tracking-wide shadow-xl shadow-orange-500/40 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 group disabled:cursor-not-allowed disabled:opacity-75 cursor-pointer"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      {isSubmitting ? "Submitting..." : step === STEPS.length - 1 ? "Submit Registration" : "Next Step"}
                    </span>
                    {!isSubmitting && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: HIGH-IMPACT VIDEO SHOWCASE PANEL */}
            <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col justify-center items-center w-full">
              <div className="relative w-full h-[580px] xl:h-[620px] rounded-[36px] overflow-hidden border border-white/25 shadow-[0_25px_60px_rgba(0,0,0,0.7)] group backdrop-blur-xl bg-black/40">
                {/* Embedded Video Player */}
                <video
                  src={loginVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Dark gradient overlay over right video frame */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

                {/* Top Badge */}
                <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-2 shadow-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                  <span>BHOI Community Portal</span>
                </div>

                {/* Bottom Showcase Info */}
                <div className="absolute bottom-8 left-8 right-8 text-white z-10">
                  <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-widest block mb-1">
                    Gujarati Network
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-white drop-shadow-md">
                    Connect. Empower. Grow.
                  </h3>
                  <p className="text-xs text-white/80 mt-2 leading-relaxed font-medium">
                    Join thousands of verified BHOI members across India and global communities. Build meaningful personal and professional relationships.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-white/20 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-400 font-bold">✓</div>
                      <div>
                        <div className="font-extrabold text-white text-xs">100% Verified</div>
                        <div className="text-[10px] text-white/60">Community Profiles</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-400 font-bold">🌐</div>
                      <div>
                        <div className="font-extrabold text-white text-xs">Global Reach</div>
                        <div className="text-[10px] text-white/60">Worldwide Members</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>

        {/* FOOTER */}
        <footer className="w-full max-w-7xl mx-auto px-6 py-4 z-20 flex flex-col md:flex-row justify-between items-center text-white/60 text-xs font-medium gap-2">
          <p>© 2026 BHOI. All rights reserved.</p>
          <p className="opacity-80 hidden md:block">Gujarati Community Network</p>
        </footer>
      </div>
    </PageTransition>
  );
}

const BlobInput = ({ label, icon: Icon, value, onChange, suffix, ...p }: any) => {
  return (
    <div className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-orange-400/50 rounded-2xl p-3.5 px-4 transition-all focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:border-orange-500 focus-within:bg-white/15 w-full backdrop-blur-md shadow-md">
      {Icon && <Icon className="w-5 h-5 text-orange-400 shrink-0" />}
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-extrabold text-orange-300 uppercase tracking-wider block leading-tight">
          {label}
        </span>
        <input
          value={value || ""}
          onChange={onChange}
          className="w-full bg-transparent border-none outline-none text-sm text-white font-bold p-0 focus:ring-0 mt-0.5 placeholder:text-white/40"
          placeholder=""
          {...p}
        />
      </div>
      {suffix && <div className="shrink-0">{suffix}</div>}
    </div>
  );
};

type SelectOption = string | { value: string; label: string };

const BlobSelect = ({
  label, options, value, onChange, placeholder
}: {
  label: string; options: SelectOption[]; value: string; onChange: (val: string) => void; placeholder?: string
}) => {
  const safeOptions = (options || []).map((o, idx) => {
    const rawVal = typeof o === "string" ? o : o?.value;
    const rawLbl = typeof o === "string" ? o : o?.label;
    const val = (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== "") ? String(rawVal) : `opt_${idx}`;
    const lbl = (rawLbl !== undefined && rawLbl !== null && String(rawLbl).trim() !== "") ? String(rawLbl) : val;
    return { val, lbl };
  });

  const selectedValue = safeOptions.some(o => o.val === value) ? value : undefined;

  return (
    <div className="bg-white/10 hover:bg-white/15 border border-white/20 hover:border-orange-400/50 rounded-2xl p-3.5 px-4 transition-all focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:border-orange-500 focus-within:bg-white/15 w-full backdrop-blur-md shadow-md">
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-extrabold text-orange-300 uppercase tracking-wider block leading-tight">
          {label}
        </span>
        <RadixSelect
          value={selectedValue}
          onValueChange={onChange}
        >
          <SelectTrigger className="w-full bg-transparent border-none outline-none shadow-none focus:ring-0 p-0 text-sm text-white font-bold flex items-center justify-between h-auto mt-0.5">
            <SelectValue placeholder={placeholder || `Select ${label}`} />
          </SelectTrigger>
          <SelectContent className="max-h-[250px] overflow-y-auto bg-[#1C100B]/95 backdrop-blur-2xl border border-white/20 text-white rounded-2xl shadow-2xl p-1.5 z-[100]">
            {safeOptions.map((o, idx) => (
              <SelectItem key={`${o.val}_${idx}`} value={o.val} className="rounded-xl text-white/90 focus:bg-orange-600 focus:text-white cursor-pointer py-2 font-semibold">
                {o.lbl}
              </SelectItem>
            ))}
          </SelectContent>
        </RadixSelect>
      </div>
    </div>
  );
};

const BlobDateOfBirth = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const [year, month, day] = value ? value.split("-") : ["", "", ""];

  const update = (y: string, m: string, d: string) => {
    const safeY = y || new Date().getFullYear().toString();
    const safeM = m ? m.padStart(2, "0") : "01";
    const safeD = d ? d.padStart(2, "0") : "01";
    onChange(`${safeY}-${safeM}-${safeD}`);
  };

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const months = [
    { value: "1", label: "Jan" }, { value: "2", label: "Feb" }, { value: "3", label: "Mar" },
    { value: "4", label: "Apr" }, { value: "5", label: "May" }, { value: "6", label: "Jun" },
    { value: "7", label: "Jul" }, { value: "8", label: "Aug" }, { value: "9", label: "Sep" },
    { value: "10", label: "Oct" }, { value: "11", label: "Nov" }, { value: "12", label: "Dec" }
  ];
  const years = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));

  const parsedDay = day && !isNaN(parseInt(day, 10)) ? String(parseInt(day, 10)) : undefined;
  const parsedMonth = month && !isNaN(parseInt(month, 10)) ? String(parseInt(month, 10)) : undefined;
  const parsedYear = year && years.includes(year) ? year : undefined;

  return (
    <div className="bg-white/10 hover:bg-white/15 border border-white/20 hover:border-orange-400/50 rounded-2xl p-3.5 px-4 transition-all focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:border-orange-500 focus-within:bg-white/15 w-full backdrop-blur-md shadow-md">
      <span className="text-[10px] font-extrabold text-orange-300 uppercase tracking-wider block leading-tight">
        Date of Birth
      </span>
      <div className="flex gap-4 items-center mt-0.5 divide-x divide-white/20">
        <RadixSelect
          value={parsedDay}
          onValueChange={(d) => update(year, month, d)}
        >
          <SelectTrigger className="flex-1 bg-transparent border-none outline-none shadow-none focus:ring-0 p-0 text-sm text-white font-bold flex items-center justify-between h-auto">
            <SelectValue placeholder="DD" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto bg-[#1C100B]/95 backdrop-blur-2xl border border-white/20 text-white rounded-xl shadow-2xl z-[100]">
            {days.map((d) => <SelectItem key={d} value={d} className="rounded-lg text-white/90 focus:bg-orange-600 focus:text-white cursor-pointer">{d}</SelectItem>)}
          </SelectContent>
        </RadixSelect>

        <RadixSelect
          value={parsedMonth}
          onValueChange={(m) => update(year, m, day)}
        >
          <SelectTrigger className="flex-1 bg-transparent border-none outline-none shadow-none focus:ring-0 p-0 pl-3 text-sm text-white font-bold flex items-center justify-between h-auto">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto bg-[#1C100B]/95 backdrop-blur-2xl border border-white/20 text-white rounded-xl shadow-2xl z-[100]">
            {months.map((m) => <SelectItem key={m.value} value={m.value} className="rounded-lg text-white/90 focus:bg-orange-600 focus:text-white cursor-pointer">{m.label}</SelectItem>)}
          </SelectContent>
        </RadixSelect>

        <RadixSelect
          value={parsedYear}
          onValueChange={(y) => update(y, month, day)}
        >
          <SelectTrigger className="flex-[1.2] bg-transparent border-none outline-none shadow-none focus:ring-0 p-0 pl-3 text-sm text-white font-bold flex items-center justify-between h-auto">
            <SelectValue placeholder="YYYY" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto bg-[#1C100B]/95 backdrop-blur-2xl border border-white/20 text-white rounded-xl shadow-2xl z-[100]">
            {years.map((y) => <SelectItem key={y} value={y} className="rounded-lg text-white/90 focus:bg-orange-600 focus:text-white cursor-pointer">{y}</SelectItem>)}
          </SelectContent>
        </RadixSelect>
      </div>
    </div>
  );
};

function Personal({
  data, onChange, setIsEmailFocused, setIsPasswordFocused, avatarFile, setAvatarFile
}: {
  data: any; onChange: (key: string, val: any) => void;
  setIsEmailFocused: (val: boolean) => void;
  setIsPasswordFocused: (val: boolean) => void;
  avatarFile: File | null;
  setAvatarFile: (f: File | null) => void;
}) {
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-start mb-6">
        <label className="cursor-pointer group flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/30 shadow-xl flex items-center justify-center overflow-hidden transition-all group-hover:scale-[1.02] duration-300 backdrop-blur-md">
              {data.photo ? <img src={data.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-9 h-9 text-orange-300" />}
              <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gradient-to-br from-[#FB923C] to-[#EA580C] flex items-center justify-center text-white shadow-lg border-2 border-black group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-3 h-3" />
            </div>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={e => {
            const f = e.target.files?.[0];
            if (f) {
              setAvatarFile(f);
              onChange("photo", URL.createObjectURL(f));
            }
          }} />

          <div className="flex flex-col justify-center">
            <h3 className="text-white font-extrabold text-base tracking-tight">Upload Profile Photo</h3>
            <p className="text-[11px] text-orange-400 font-semibold mt-0.5 uppercase tracking-wider">JPG, PNG (Max 5MB)</p>
          </div>
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
        <BlobInput label="Full Name" placeholder="" value={data.fullName} onChange={(e: any) => onChange("fullName", e.target.value)} icon={User} />
        <BlobDateOfBirth value={data.dob} onChange={(val: string) => onChange("dob", val)} />
      </div>

      <div className="w-full">
        <span className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider block mb-2">Gender</span>
        <div className="flex items-center w-full p-1 bg-white/10 border border-white/20 rounded-2xl shadow-md backdrop-blur-md">
          {["Male", "Female"].map(g => (
            <button key={g} type="button" onClick={() => onChange("gender", g)} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${data.gender === g ? "bg-gradient-to-r from-[#F25C05] to-[#FFA74D] text-white shadow-lg shadow-orange-500/40" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
        <BlobInput
          label="Mobile Number"
          placeholder=""
          value={data.mobile}
          onChange={(e: any) => onChange("mobile", e.target.value)}
          icon={Phone}
          onFocus={() => setIsEmailFocused(true)}
          onBlur={() => setIsEmailFocused(false)}
        />
        <BlobInput
          label="Email Address"
          type="email"
          placeholder=""
          value={data.email}
          onChange={(e: any) => onChange("email", e.target.value)}
          icon={Mail}
          onFocus={() => setIsEmailFocused(true)}
          onBlur={() => setIsEmailFocused(false)}
        />
      </div>

      <div className="relative">
        <BlobInput
          label="Password"
          type={showPwd ? "text" : "password"}
          placeholder=""
          value={data.password || ""}
          onChange={(e: any) => onChange("password", e.target.value)}
          icon={Lock}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
          suffix={
            <button
              type="button"
              className="p-1 rounded-md text-orange-300 hover:text-white hover:bg-white/10 transition-colors pointer-events-auto"
              onClick={() => setShowPwd(!showPwd)}
            >
              {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
        />
        {data.password && (() => {
          const getPasswordStrength = (pwd: string) => {
            if (!pwd) return { score: 0, label: "", color: "bg-white/20", text: "text-white/40" };
            let score = 0;
            if (pwd.length >= 8) score++;
            if (/[A-Z]/.test(pwd)) score++;
            if (/[a-z]/.test(pwd)) score++;
            if (/\d/.test(pwd)) score++;
            if (/[@$!%*?&]/.test(pwd)) score++;

            if (score <= 2) return { score, label: "Weak", color: "bg-red-500", text: "text-red-400" };
            if (score <= 4) return { score, label: "Medium", color: "bg-amber-500", text: "text-amber-400" };
            return { score, label: "Strong", color: "bg-emerald-500", text: "text-emerald-400" };
          };
          const strObj = getPasswordStrength(data.password);
          return (
            <div className="mt-2 px-1">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider mb-1">
                <span className="text-white/70">Password Strength</span>
                <span className={strObj.text}>{strObj.label}</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strObj.color}`}
                  style={{ width: `${(strObj.score / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

const DISTRICTS_OF_STATE: Record<string, string[]> = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley", "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"],
  "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan", "Kamrup", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Dima Hasao", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
  "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran (Motihari)", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur (Bhabua)", "Katihar", "Khagaria", "Kishanjganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger (Monghyr)", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia (Purnea)", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
  "Chandigarh (UT)": ["Chandigarh"],
  "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada (South Bastar)", "Dhamtari", "Durg", "Gariyaband", "Janjgir-Champa", "Jashpur", "Kabirdham (Kawardha)", "Kanker (North Bastar)", "Kondagaon", "Korba", "Korea (Koriya)", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
  "Dadra and Nagar Haveli (UT)": ["Dadra & Nagar Haveli"],
  "Daman and Diu (UT)": ["Daman", "Diu"],
  "Delhi (NCT)": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East  Delhi", "North West  Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West  Delhi", "West Delhi"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha (Palanpur)", "Bharuch", "Bhavnagar", "Botad", "Chhota Udepur", "Dahod", "Dangs (Ahwa)", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kachchh", "Kheda (Nadiad)", "Mahisagar", "Mehsana", "Morbi", "Narmada (Rajpipla)", "Navsari", "Panchmahal (Godhra)", "Patan", "Porbandar", "Rajkot", "Sabarkantha (Himmatnagar)", "Surat", "Surendranagar", "Tapi (Vyara)", "Vadodara", "Valsad"],
  "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurgaon", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Mewat", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul & Spiti", "Mandi", "Shimla", "Sirmaur (Sirmour)", "Solan", "Una"],
  "Jammu and Kashmir": ["Anantnag", "Bandipore", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kargil", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Leh", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
  "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribag", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela-Kharsawan", "Simdega", "West Singhbhum"],
  "Karnataka": ["Bagalkot", "Ballari (Bellary)", "Belagavi (Belgaum)", "Bengaluru (Bangalore) Rural", "Bengaluru (Bangalore) Urban", "Bidar", "Chamarajanagar", "Chikballapur", "Chikkamagaluru (Chikmagalur)", "Chitradurga", "Dakshina Kannada", "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi (Gulbarga)", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru (Mysore)", "Raichur", "Ramanagara", "Shivamogga (Shimoga)", "Tumakuru (Tumkur)", "Udupi", "Uttara Kannada (Karwar)", "Vijayapura (Bijapur)", "Yadgir"],
  "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
  "Lakshadweep (UT)": ["Agatti", "Amini", "Androth", "Bithra", "Chethlath", "Kavaratti", "Kadmath", "Kalpeni", "Kilthan", "Minicoy"],
  "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
  "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
  "Mizoram": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"],
  "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
  "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deoghar", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghapur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar (Keonjhar)", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Sonepur", "Sundargarh"],
  "Puducherry (UT)": ["Karaikal", "Mahe", "Pondicherry", "Yanam"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Nawanshahr (Shahid Bhagat Singh Nagar)", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar (Mohali)", "Sangrur", "Tarn Taran"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
  "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "Tamil Nadu": ["Ariyalur", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Salem", "Sivaganga", "Thanjavur", "Theni", "Thoothukudi (Tuticorin)", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
  "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhoopalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal", "Nagarkurnool", "Nalgonda", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal (Rural)", "Warangal (Urban)", "Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Amethi (Chatrapati Sahuji Mahraj Nagar)", "Amroha (J.P. Nagar)", "Auraiya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur (Panchsheel Nagar)", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kanshiram Nagar (Kasganj)", "Kaushambi", "Kushinagar (Padrauna)", "Lakhimpur - Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "RaeBareli", "Rampur", "Saharanpur", "Sambhal (Bhim Nagar)", "Sant Kabir Nagar", "Shahjahanpur", "Shamali (Prabuddh Nagar)", "Shravasti", "Siddharth Nagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
  "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
  "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Burdwan (Bardhaman)", "Cooch Behar", "Dakshin Dinajpur (South Dinajpur)", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Kalimpong", "Kolkata", "Malda", "Mursibad", "Nadia", "North 24 Parganas", "Paschim Medinipur (West Medinipur)", "Purba Medinipur (East Medinipur)", "Purulia", "South 24 Parganas", "Uttar Dinajpur (North Dinajpur)"]
};

const STATES_OF_INDIA = Object.keys(DISTRICTS_OF_STATE);

const LOCATION_DATA: Record<string, string[]> = {
  "India": STATES_OF_INDIA,
  "United States": ["California", "New York", "Texas", "Florida", "Illinois"],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
  "Canada": ["Ontario", "Quebec", "British Columbia", "Alberta"],
  "Australia": ["New South Wales", "Victoria", "Queensland", "Western Australia"],
  "United Arab Emirates": ["Abu Dhabi", "Dubai", "Sharjah", "Ajman"]
};

const TALUKAS_OF_DISTRICT: Record<string, string[]> = {
  "Amreli": ["Rajula", "Khambha", "Una", "Jafrabad", "Amreli", "Babra", "Lathi", "Liliya", "Dhari", "Kunkavav", "Savar Kundla"],
  "Surat": ["Choryasi", "Kamrej", "Olpad", "Palsana", "Bardoli", "Mahuva", "Mandvi", "Mangrol", "Umarpada"],
  "Ahmedabad": ["City", "Daskroi", "Sanand", "Viramgam", "Dholka", "Dhandhuka", "Bavla", "Detroj", "Mandal"],
  "Rajkot": ["Rajkot", "Gondal", "Jetpur", "Morbi", "Wankaner", "Dhoraji", "Kotda Sangani", "Jasdan", "Lodhika", "Upleta"],
  "Bhavnagar": ["Bhavnagar", "Mahuva", "Taja", "Palitana", "Gariadhar", "Sihor", "Umrala", "Vallabhipur", "Jeshawada"],
  "Vadodara": ["Vadodara", "Dabhoi", "Karjan", "Padra", "Savli", "Sinor", "Waghodia"],
  "Gandhinagar": ["Gandhinagar", "Kalol", "Dehgam", "Mansa"],

  "Mumbai": ["Mumbai City", "Mumbai Suburban"],
  "Pune": ["Pune City", "Haveli", "Baramati", "Shirur", "Maval", "Khed", "Junner", "Ambegaon", "Indapur", "Daund"],
  "Thane": ["Thane", "Kalyan", "Ulhasnagar", "Bhiwandi", "Shahapur", "Murbad", "Ambarnath"],
  "Nagpur": ["Nagpur Urban", "Nagpur Rural", "Kamptee", "Katol", "Ramtek", "Saoner", "Umred"],

  "Jaipur": ["Jaipur", "Sanganer", "Amer", "Chomu", "Phulera", "Bass", "Jamwa Ramgarh", "Kotputli"],
  "Jodhpur": ["Jodhpur", "Luni", "Bilara", "Shergarh", "Osian", "Phalodi", "Piparcity"],

  "New Delhi": ["Chanakyapuri", "Delhi Cantonment", "Vasant Vihar"],
  "South Delhi": ["Saket", "Hauz Khas", "Mehrauli"]
};

const VILLAGES_OF_TALUKA: Record<string, string[]> = {
  "Rajula": ["Rampara", "Rajula", "Kovaya", "Hindorna", "Victor", "Vavera", "Zanpath", "Pipavav"],
  "Khambha": ["Khambha", "Dedan", "Raydi", "Nani Dhari", "Bhad", "Kantala", "Tulsishyam", "Dhavadiya"],
  "Una": ["Una", "Delvada", "Kanek", "Simar", "Gadhada", "Dhamlej", "Vansaj", "Sana"],
  "Jafrabad": ["Jafrabad", "Lunsapur", "Varahswarup", "Shiyalbet", "Vadhera", "Babra", "Sarkleshwar"],
  "Amreli": ["Amreli", "Chital", "Babra", "Lathi", "Liliya", "Gavadka", "Devrajia", "Haripura"],

  "Choryasi": ["Surat", "Dumas", "Hazira", "Bhatha", "Sarsana", "Ichhapore", "Suvali"],
  "Kamrej": ["Kamrej", "Kholvad", "Kathor", "Vav", "Valak", "Laskana", "Netrang"],
  "Olpad": ["Olpad", "Sayan", "Karanj", "Kim", "Mulad", "Saras", "Ten"],

  "City": ["Ahmedabad City", "Vastrapur", "Satellite", "Bodakdev", "Thaltej", "Ghatlodia", "Girdharnagar"],
  "Sanand": ["Sanand", "Changodar", "Nalsarovar", "Iyava", "Moti Devti", "Shela", "Telav"],
  "Daskroi": ["Bareja", "Gatrad", "Jetalpur", "Kasindra", "Lambha", "Aslali", "Kuha"],

  "Rajkot": ["Rajkot City", "Madhapar", "Mavdi", "Kotharia", "Shapar", "Veraval", "Metoda"],
  "Gondal": ["Gondal", "Ribda", "Virpur", "Moti Marad", "Bhojpara", "Gundala", "Hadamtala"],

  "Pune City": ["Kothrud", "Shivajinagar", "Aundh", "Hadapsar", "Viman Nagar", "Kalyani Nagar", "Koregaon Park"],
  "Haveli": ["Wagholi", "Hadapsar", "Kondhwa", "Dhanori", "Fursungi", "Pisoli", "Undri"],

  "Jaipur": ["Jaipur City", "Mansarovar", "Malviya Nagar", "Vaishali Nagar", "C-Scheme", "Raja Park"],
  "Sanganer": ["Sanganer", "Pratap Nagar", "Jagatpura", "Sitapura", "Muhana", "Watika"]
};

function LocationStep({ data, onChange }: { data: any; onChange: (key: string, val: any) => void }) {
  const [showCustomTaluka, setShowCustomTaluka] = useState(false);
  const [showCustomVillage, setShowCustomVillage] = useState(false);

  const states = LOCATION_DATA[data.country] || [];
  const districts = DISTRICTS_OF_STATE[data.state] || [`${data.state} District 1`, `${data.state} District 2`];
  const talukas = TALUKAS_OF_DISTRICT[data.district] || [`${data.district} Taluka 1`, `${data.district} Taluka 2`];
  const villages = data.taluka ? (VILLAGES_OF_TALUKA[data.taluka] || [`${data.taluka} Village 1`, `${data.taluka} Village 2`]) : [];

  const handleCountryChange = (val: string) => { onChange("country", val); handleStateChangeInternal(val, LOCATION_DATA[val]?.[0] || ""); };
  const handleStateChangeInternal = (countryVal: string, stateVal: string) => { onChange("state", stateVal); handleDistrictChangeInternal(countryVal, stateVal, (DISTRICTS_OF_STATE[stateVal] || [`${stateVal} District 1`])[0] || ""); };
  const handleStateChange = (val: string) => handleStateChangeInternal(data.country, val);
  const handleDistrictChangeInternal = (countryVal: string, stateVal: string, districtVal: string) => { onChange("district", districtVal); handleTalukaChangeInternal((TALUKAS_OF_DISTRICT[districtVal] || [`${districtVal} Taluka 1`])[0] || ""); };
  const handleDistrictChange = (val: string) => handleDistrictChangeInternal(data.country, data.state, val);

  const handleTalukaChangeInternal = (talukaVal: string) => {
    if (talukaVal === "Other (Type Custom)") { setShowCustomTaluka(true); onChange("taluka", ""); onChange("village", ""); }
    else { setShowCustomTaluka(false); onChange("taluka", talukaVal); onChange("village", (VILLAGES_OF_TALUKA[talukaVal] || [`${talukaVal} Village 1`])[0] || ""); }
  };
  const handleTalukaChange = (val: string) => handleTalukaChangeInternal(val);

  const handleVillageChange = (val: string) => {
    if (val === "Other (Type Custom)") { setShowCustomVillage(true); onChange("village", ""); }
    else { setShowCustomVillage(false); onChange("village", val); }
  };

  const talukaOptions = [...talukas, "Other (Type Custom)"];
  const villageOptions = [...villages, "Other (Type Custom)"];

  const [isTextareaFocused, setIsTextareaFocused] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
        <BlobSelect label="Country" options={Object.keys(LOCATION_DATA)} value={data.country} onChange={handleCountryChange} />
        <BlobSelect label="State" options={states} value={data.state} onChange={handleStateChange} />
      </div>

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
        <BlobSelect label="District" options={districts} value={data.district} onChange={handleDistrictChange} />
        {showCustomTaluka ? (
          <div>
            <BlobInput label="Taluka (Custom)" placeholder="" value={data.taluka} onChange={(e: any) => onChange("taluka", e.target.value)} />
            <button type="button" onClick={() => handleTalukaChangeInternal(talukas[0] || "")} className="text-[12px] font-bold text-[#EA580C] hover:underline mt-2 ml-2">← Select from list</button>
          </div>
        ) : (
          <BlobSelect label="Taluka" options={talukaOptions} value={data.taluka} onChange={handleTalukaChange} />
        )}
      </div>

      {showCustomVillage ? (
        <div>
          <BlobInput label="Village (Custom)" placeholder="" value={data.village} onChange={(e: any) => onChange("village", e.target.value)} />
          <button type="button" onClick={() => handleVillageChange(villages[0] || "")} className="text-[12px] font-bold text-[#EA580C] hover:underline mt-2 ml-2">← Select from list</button>
        </div>
      ) : (
        <BlobSelect label="Village" options={villageOptions} value={data.village} onChange={handleVillageChange} />
      )}

      <div className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl p-3.5 px-4 transition-all focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:border-orange-500 focus-within:bg-white/15 w-full backdrop-blur-md shadow-md">
        <span className="text-[10px] font-extrabold text-orange-300 uppercase tracking-wider block leading-tight">
          Full Address
        </span>
        <textarea
          rows={2}
          className="w-full bg-transparent border-none outline-none text-sm text-white font-bold p-0 focus:ring-0 mt-1 resize-none placeholder:text-white/40"
          placeholder="Enter your full home address"
          value={data.address}
          onChange={(e: any) => onChange("address", e.target.value)}
        />
      </div>
    </div>
  );
}

function Education({ data, onChange }: { data: any; onChange: (key: string, val: any) => void }) {
  return (
    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
      <BlobInput label="School" value={data.school} onChange={(e: any) => onChange("school", e.target.value)} placeholder="" />
      <BlobInput label="College" value={data.college} onChange={(e: any) => onChange("college", e.target.value)} placeholder="" />
      <BlobInput label="Degree" value={data.degree} onChange={(e: any) => onChange("degree", e.target.value)} placeholder="" />
      <BlobInput label="Field of Study" value={data.fieldOfStudy} onChange={(e: any) => onChange("fieldOfStudy", e.target.value)} placeholder="" />
      <BlobInput label="Passing Year" type="number" value={data.passingYear} onChange={(e: any) => onChange("passingYear", e.target.value)} placeholder="" />
    </div>
  );
}

const BIZ_CATEGORIES_REG = [
  "Food & Bakery", "Manufacturing", "Jewellery", "Healthcare", "Textile",
  "Construction", "Automobile", "Professional", "Education", "Technology",
  "Retail", "Agriculture", "Finance", "Transport", "Other"
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TIME_OPTIONS = [
  "Closed", "Open 24 Hours",
  "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"
];

function Profession({
  data,
  onChange,
  logoFile,
  setLogoFile,
  galleryFiles,
  setGalleryFiles,
  galleryPreviews,
  setGalleryPreviews
}: {
  data: any;
  onChange: (key: string, val: any) => void;
  logoFile: File | null;
  setLogoFile: (f: File | null) => void;
  galleryFiles: File[];
  setGalleryFiles: (files: File[]) => void;
  galleryPreviews: string[];
  setGalleryPreviews: (previews: string[]) => void;
}) {
  const [bizTab, setBizTab] = useState<"basic" | "contact" | "hours">("basic");

  const updateHours = (day: string, val: string) => {
    onChange("businessHours", { ...data.businessHours, [day]: val });
  };

  const parseHour = (dayVal: string, part: "open" | "close") => {
    if (!dayVal || dayVal === "Closed" || dayVal === "Open 24 Hours") return "";
    const parts = dayVal.split(" - ");
    return part === "open" ? (parts[0] || "") : (parts[1] || "");
  };

  const setHourPart = (day: string, part: "open" | "close", val: string) => {
    const current = data.businessHours?.[day] || "";
    if (val === "Closed" || val === "Open 24 Hours") {
      updateHours(day, val);
      return;
    }
    const open = part === "open" ? val : parseHour(current, "open");
    const close = part === "close" ? val : parseHour(current, "close");
    if (open && close) updateHours(day, `${open} - ${close}`);
    else if (open) updateHours(day, open);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...galleryFiles, ...files].slice(0, 10);
    setGalleryFiles(newFiles);
    setGalleryPreviews(newFiles.map(f => URL.createObjectURL(f)));
  };

  const removeGalleryPhoto = (index: number) => {
    const newFiles = galleryFiles.filter((_, i) => i !== index);
    setGalleryFiles(newFiles);
    setGalleryPreviews(newFiles.map(f => URL.createObjectURL(f)));
  };

  return (
    <div className="space-y-5">
      {/* Profession Type Toggle */}
      <div className="relative w-full">
        <span className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider block mb-2">Profession Type</span>
        <div className="flex items-center w-full p-1 bg-white/10 border border-white/20 rounded-full shadow-sm backdrop-blur-md">
          {(["Job", "Business"] as const).map(x => (
            <button key={x} type="button" onClick={() => onChange("professionType", x)}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all duration-300 ${data.professionType === x
                  ? "bg-gradient-to-r from-[#F25C05] to-[#FFA74D] text-white shadow-md shadow-orange-500/30"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}>
              {x}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {data.professionType === "Job" ? (
          <motion.div key="job" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid sm:grid-cols-2 gap-x-6 gap-y-5">

            {/* Row 1: Job Title + Job Type */}
            <BlobInput label="Job Title" value={data.jobTitle} onChange={(e: any) => onChange("jobTitle", e.target.value)} placeholder="" />
            <div className="flex flex-col gap-2">
              <BlobSelect
                label="Job Type / Profession"
                options={[
                  "IT & Software", "Engineering", "Healthcare & Medical", "Education & Teaching",
                  "Finance & Accounting", "Sales & Marketing", "Government & Defence", "Legal",
                  "Agriculture & Farming", "Construction & Real Estate", "Retail & Commerce",
                  "Media & Entertainment", "Hospitality & Tourism", "Transport & Logistics",
                  "Manufacturing", "Research & Science", "Arts & Design", "Other"
                ]}
                value={data.jobType || ""}
                onChange={(val: string) => { onChange("jobType", val); if (val !== "Other") onChange("jobTypeOther", ""); }}
              />
              {data.jobType === "Other" && (
                <BlobInput
                  label="Specify Job Type"
                  value={data.jobTypeOther || ""}
                  onChange={(e: any) => onChange("jobTypeOther", e.target.value)}
                  placeholder="e.g. Event Planner, Astrologer..."
                />
              )}
            </div>

            {/* Row 2: Company + Industry */}
            <BlobInput label="Company" value={data.company} onChange={(e: any) => onChange("company", e.target.value)} placeholder="" />
            <BlobInput label="Industry" value={data.industry} onChange={(e: any) => onChange("industry", e.target.value)} placeholder="" />

            {/* Row 3: Annual Salary + Work Mode */}
            <BlobInput label="Annual Salary (LPA)" type="number" value={data.salary} onChange={(e: any) => onChange("salary", e.target.value)} placeholder="" />
            <BlobSelect
              label="Work Mode"
              options={["On-site", "Remote", "Hybrid"]}
              value={data.jobWorkMode || "On-site"}
              onChange={(val: string) => onChange("jobWorkMode", val)}
            />

            {/* Job Location Section Header */}
            <div className="sm:col-span-2">
              <span className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider block mb-0">Job Location</span>
              <div className="h-px bg-white/20 mt-1" />
            </div>

            {/* Row 4: Job City + Job State */}
            <BlobInput label="Job City" value={data.jobCity || ""} onChange={(e: any) => onChange("jobCity", e.target.value)} placeholder="e.g. Ahmedabad" />
            <BlobInput label="Job State" value={data.jobState || ""} onChange={(e: any) => onChange("jobState", e.target.value)} placeholder="e.g. Gujarat" />

            {/* Row 5: Job Country + Job Full Address */}
            <BlobSelect
              label="Job Country"
              options={["India", "United States", "United Kingdom", "Canada", "Australia", "United Arab Emirates", "Other"]}
              value={data.jobCountry || "India"}
              onChange={(val: string) => onChange("jobCountry", val)}
            />
            <div className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl p-3.5 px-4 transition-all focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:border-orange-500 focus-within:bg-white/15 w-full backdrop-blur-md shadow-md">
              <span className="text-[10px] font-extrabold text-orange-300 uppercase tracking-wider block leading-tight">Job Address</span>
              <textarea
                rows={2}
                className="w-full bg-transparent border-none outline-none text-sm text-white font-bold p-0 focus:ring-0 mt-1 resize-none placeholder:text-white/40"
                placeholder="Office / workplace full address"
                value={data.jobAddress || ""}
                onChange={(e: any) => onChange("jobAddress", e.target.value)}
              />
            </div>

          </motion.div>
        ) : (
          <motion.div key="business" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {/* Sub-tabs */}
            <div className="flex gap-1 bg-white/10 border border-white/20 rounded-2xl p-1 backdrop-blur-md">
              {(["basic", "contact", "hours"] as const).map(tab => (
                <button key={tab} type="button" onClick={() => setBizTab(tab)}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${bizTab === tab
                      ? "bg-gradient-to-r from-[#F25C05] to-[#FFA74D] text-white shadow-md shadow-orange-500/30"
                      : "text-white/70 hover:text-white"
                    }`}>
                  {tab === "basic" ? "Basic Info" : tab === "contact" ? "Contact & Location" : "Hours & Socials"}
                </button>
              ))}
            </div>

            {/* TAB: Basic Info */}
            {bizTab === "basic" && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <BlobInput label="Business / Shop Name *" value={data.businessName} onChange={(e: any) => onChange("businessName", e.target.value)} placeholder="" />
                  <BlobSelect label="Category / Sector *" options={BIZ_CATEGORIES_REG} value={data.businessCategory} onChange={v => onChange("businessCategory", v)} />
                  <BlobInput label="GST Number" value={data.gstNo} onChange={(e: any) => onChange("gstNo", e.target.value)} placeholder="" />
                  <BlobInput label="Years in Business *" type="number" min="0" value={data.businessYears} onChange={(e: any) => onChange("businessYears", e.target.value)} placeholder="" />
                </div>
                {/* Business Logo upload */}
                <div>
                  <span className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider block mb-2">Business Logo</span>
                  <label className="flex items-center gap-4 border border-dashed border-white/30 hover:border-orange-400 bg-white/10 rounded-2xl p-4 cursor-pointer transition-all group backdrop-blur-md">
                    <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-400/40 overflow-hidden shrink-0">
                      {data.businessLogo
                        ? <img src={data.businessLogo} alt="" className="w-full h-full object-cover" />
                        : <Upload className="w-5 h-5 text-orange-400" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{data.businessLogo ? "Logo selected ✓" : "Upload Business Logo"}</div>
                      <div className="text-[11px] text-white/60 font-semibold mt-0.5">PNG, JPG (square, max 2MB)</div>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setLogoFile(f);
                        onChange("businessLogo", URL.createObjectURL(f));
                      }
                    }} />
                  </label>
                </div>
                {/* Business Gallery Photos */}
                <div>
                  <span className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider block mb-2">Business Photos (Gallery)</span>
                  <label className="flex flex-col items-center justify-center border border-dashed border-white/30 hover:border-orange-400 bg-white/10 rounded-2xl p-6 cursor-pointer transition-all group backdrop-blur-md">
                    <Upload className="w-6 h-6 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-bold text-white">Select Business Photos</div>
                    <div className="text-[11px] text-white/60 font-semibold mt-0.5">PNG, JPG (up to 10 photos, max 2MB each)</div>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryChange} />
                  </label>

                  {/* Selected Gallery Previews */}
                  {galleryPreviews.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 mt-3">
                      {galleryPreviews.map((src, idx) => (
                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-white/20 bg-black/40 group">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeGalleryPhoto(idx)}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white rounded-xl">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Description */}
                <div className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl p-3.5 px-4 focus-within:border-orange-500 focus-within:bg-white/15 transition-all backdrop-blur-md">
                  <span className="text-[10px] font-extrabold text-orange-300 uppercase tracking-wider block mb-1">Public Description</span>
                  <textarea rows={3} value={data.businessDesc} onChange={e => onChange("businessDesc", e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm text-white font-bold resize-none focus:ring-0 placeholder:text-white/40"
                    placeholder="Briefly describe your products & services..."
                  />
                </div>
              </div>
            )}

            {/* TAB: Contact & Location */}
            {bizTab === "contact" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <BlobInput label="Business Phone" type="tel" icon={Phone} value={data.businessPhone} onChange={(e: any) => onChange("businessPhone", e.target.value)} placeholder="" />
                <BlobInput label="WhatsApp Number" type="tel" icon={Phone} value={data.businessWhatsapp} onChange={(e: any) => onChange("businessWhatsapp", e.target.value)} placeholder="" />
                <BlobInput label="Business Email" type="email" icon={Mail} value={data.businessEmail} onChange={(e: any) => onChange("businessEmail", e.target.value)} placeholder="" />
                <BlobInput label="Website URL" type="url" icon={Globe} value={data.businessWebsite} onChange={(e: any) => onChange("businessWebsite", e.target.value)} placeholder="" />
                <div className="sm:col-span-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl p-3.5 px-4 focus-within:border-orange-500 focus-within:bg-white/15 transition-all backdrop-blur-md">
                  <span className="text-[10px] font-extrabold text-orange-300 uppercase tracking-wider block mb-1">Business Address</span>
                  <textarea rows={2} value={data.businessAddress} onChange={e => onChange("businessAddress", e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm text-white font-bold resize-none focus:ring-0 placeholder:text-white/40"
                    placeholder="Street, Area, Landmark..."
                  />
                </div>
                <BlobInput label="City" icon={MapPin} value={data.businessCity} onChange={(e: any) => onChange("businessCity", e.target.value)} placeholder="" />
                <BlobInput label="State" value={data.businessState} onChange={(e: any) => onChange("businessState", e.target.value)} placeholder="" />
                <BlobInput label="Pincode" type="number" value={data.businessPincode} onChange={(e: any) => onChange("businessPincode", e.target.value)} placeholder="" />
              </div>
            )}

            {/* TAB: Hours & Socials */}
            {bizTab === "hours" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Operating Hours
                  </span>
                  {DAYS.map(day => {
                    const val = data.businessHours?.[day] || "Closed";
                    const isClosed = val === "Closed";
                    const isAllDay = val === "Open 24 Hours";
                    return (
                      <div key={day} className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 backdrop-blur-md">
                        <span className="text-[11px] font-bold text-white w-24 shrink-0">{day}</span>
                        <select value={isClosed ? "Closed" : isAllDay ? "Open 24 Hours" : "custom"}
                          onChange={e => {
                            if (e.target.value === "Closed") updateHours(day, "Closed");
                            else if (e.target.value === "Open 24 Hours") updateHours(day, "Open 24 Hours");
                            else updateHours(day, "09:00 AM - 07:00 PM");
                          }}
                          className="text-[11px] bg-orange-500/20 border border-orange-400/40 rounded-lg px-2 py-1 font-bold text-orange-300 focus:outline-none">
                          <option value="Closed" className="bg-[#1C100B] text-white">Closed</option>
                          <option value="Open 24 Hours" className="bg-[#1C100B] text-white">Open 24 Hours</option>
                          <option value="custom" className="bg-[#1C100B] text-white">Custom Hours</option>
                        </select>
                        {!isClosed && !isAllDay && (
                          <>
                            <select value={parseHour(val, "open")}
                              onChange={e => setHourPart(day, "open", e.target.value)}
                              className="text-[11px] bg-[#1C100B] border border-white/20 rounded-lg px-2 py-1 font-semibold text-white focus:outline-none flex-1">
                              <option value="">Open</option>
                              {TIME_OPTIONS.filter(t => t !== "Closed" && t !== "Open 24 Hours").map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <span className="text-[11px] text-white/60 font-bold">–</span>
                            <select value={parseHour(val, "close")}
                              onChange={e => setHourPart(day, "close", e.target.value)}
                              className="text-[11px] bg-[#1C100B] border border-white/20 rounded-lg px-2 py-1 font-semibold text-white focus:outline-none flex-1">
                              <option value="">Close</option>
                              {TIME_OPTIONS.filter(t => t !== "Closed" && t !== "Open 24 Hours").map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <span className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider block">Social Media Links</span>
                  <BlobInput label="Instagram" icon={Instagram} value={data.businessInstagram} onChange={(e: any) => onChange("businessInstagram", e.target.value)} placeholder="" />
                  <BlobInput label="Facebook" icon={Facebook} value={data.businessFacebook} onChange={(e: any) => onChange("businessFacebook", e.target.value)} placeholder="" />
                  <BlobInput label="YouTube" icon={Youtube} value={data.businessYoutube} onChange={(e: any) => onChange("businessYoutube", e.target.value)} placeholder="" />
                  <BlobInput label="LinkedIn" icon={Linkedin} value={data.businessLinkedin} onChange={(e: any) => onChange("businessLinkedin", e.target.value)} placeholder="" />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Community({ data, onChange, communities }: { data: any; onChange: (key: string, val: any) => void; communities: any[] }) {
  const options = communities.map(c => ({
    value: c.id.toString(),
    label: c.path && Array.isArray(c.path) ? c.path.join(" → ") : (c.parent_name ? `${c.parent_name} → ${c.name}` : c.name)
  }));
  const handleCommunityChange = (id: string) => {
    const selected = communities.find(c => c.id.toString() === id);
    if (selected) {
      onChange("communityId", selected.id.toString());
      onChange("communityName", selected.name);
      onChange("cState", selected.state);
      onChange("cDistrict", selected.district);
      onChange("cTaluka", selected.taluka);
    }
  };
  const selectedCommunity = communities.find(c => c.id.toString() === data.communityId);
  const pathArr: string[] = selectedCommunity?.path && Array.isArray(selectedCommunity.path)
    ? selectedCommunity.path
    : selectedCommunity?.parent_name
      ? [selectedCommunity.parent_name, selectedCommunity.name]
      : [selectedCommunity?.name || data.communityName || ""];

  return (
    <div className="space-y-6">
      <BlobSelect label="Select Community" options={options.length > 0 ? options : [{ value: "1", label: "Rampara Ahir Samaj" }]} value={data.communityId || (communities[0]?.id.toString() || "1")} onChange={handleCommunityChange} />

      {/* Warning banner to guide community selection */}
      <div className="p-4 bg-amber-500/15 border border-amber-400/30 rounded-2xl flex items-start gap-3 text-xs text-amber-200 backdrop-blur-md">
        <svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
        <span><strong>Important:</strong> Make sure you select the <strong>exact community</strong> you belong to. Selecting the wrong community will delay your approval.</span>
      </div>

      {/* Selected community card with hierarchy */}
      {selectedCommunity && (
        <div className="p-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-sm">
          <div className="text-[10px] uppercase tracking-wider font-extrabold text-orange-400 mb-3">✅ Your Selected Community</div>

          {/* Hierarchy breadcrumb */}
          <div className="flex flex-wrap items-center gap-1 mb-3">
            {pathArr.map((node, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${i === pathArr.length - 1 ? "bg-[#EA580C] text-white border-[#EA580C]" : "bg-orange-500/20 text-orange-300 border-orange-400/40"}`}>
                  {node}
                </span>
                {i < pathArr.length - 1 && <span className="text-orange-400 font-bold">→</span>}
              </span>
            ))}
          </div>

          {/* Community details */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-white/80">
            {selectedCommunity.state && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-orange-400">State:</span> {selectedCommunity.state}
              </div>
            )}
            {selectedCommunity.district && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-orange-400">District:</span> {selectedCommunity.district}
              </div>
            )}
            {selectedCommunity.type && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-orange-400">Type:</span> {selectedCommunity.type}
              </div>
            )}
            {selectedCommunity.plan && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-orange-400">Plan:</span> {selectedCommunity.plan}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Verify({
  data, onChange, aadhaarFile, setAadhaarFile
}: {
  data: any; onChange: (key: string, val: any) => void;
  aadhaarFile: File | null;
  setAadhaarFile: (f: File | null) => void;
}) {
  return (
    <div className="space-y-6">
      <BlobInput label="Aadhaar Number" placeholder="" value={data.aadhaarNo} onChange={(e: any) => onChange("aadhaarNo", e.target.value)} />

      <div className="relative w-full pt-4">
        <span className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider block mb-2">Aadhaar Card Copy</span>
        <label className="block border-2 border-dashed border-white/30 hover:border-orange-400 bg-white/10 backdrop-blur-md p-8 text-center cursor-pointer transition-all rounded-2xl group shadow-sm">
          <div className="w-12 h-12 rounded-full bg-orange-500/20 mx-auto flex items-center justify-center mb-3 group-hover:bg-orange-500/30 transition-colors">
            <Upload className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-sm font-bold text-white">{data.aadhaarPhoto ? `Selected: ${data.aadhaarPhoto}` : "Upload Aadhaar Photo"}</div>
          <div className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider mt-1">{data.aadhaarPhoto ? "Click to replace" : "PDF, JPG or PNG (max 5MB)"}</div>
          <input type="file" className="hidden" onChange={e => {
            const f = e.target.files?.[0];
            if (f) {
              setAadhaarFile(f);
              onChange("aadhaarPhoto", f.name);
            }
          }} />
        </label>
      </div>

      <label className="flex items-start gap-3 text-xs font-semibold text-white/80 cursor-pointer ml-1 mt-6">
        <input type="checkbox" className="mt-0.5 accent-[#EA580C] w-4 h-4 rounded border-white/30" />
        <span>I confirm that all details provided are correct to the best of my knowledge and I accept the <span className="text-orange-400 font-bold hover:underline">Terms of Service</span>.</span>
      </label>
    </div>
  );
}

function Success({ data, onClose }: { data: any; onClose: () => void }) {
  return (
    <div className="min-h-screen bg-[#FCF5EC] flex items-center justify-center px-6 font-sans">
      <div className="bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(238,150,80,0.12)] p-10 max-w-md w-full border border-orange-200/50 text-center relative rounded-[32px]">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 border-[6px] border-[#FCF5EC]">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}><CheckCircle2 className="w-12 h-12 text-white" /></motion.div>
        </motion.div>

        <h2 className="font-serif text-3xl font-bold text-[#2C1D12] mb-2 mt-8">Submitted!</h2>
        <p className="text-[#7A6455] mt-2 text-sm font-semibold">Your details have been sent to <strong className="text-[#EA580C] font-bold">{data.communityName || "your community"}</strong> for verification.</p>

        <div className="mt-8 text-left space-y-4 text-xs bg-orange-50/50 backdrop-blur-sm rounded-2xl p-6 border border-orange-100">
          <div className="font-bold text-[#EA580C] uppercase tracking-wide text-[11px]">Your Login Credentials</div>
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <span className="text-[#7A6455] text-[10px] font-bold uppercase tracking-wider">Email / Phone</span>
              <span className="bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-orange-200/50 font-bold text-[#2C1D12] text-sm shadow-sm">{data.email || data.mobile}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[#7A6455] text-[10px] font-bold uppercase tracking-wider">Password</span>
              <span className="bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-orange-200/50 font-bold text-[#2C1D12] text-sm shadow-sm">{data.password || "User123!"}</span>
            </div>
          </div>
          <div className="text-[11px] text-[#7A6455]/80 leading-relaxed font-semibold mt-4 pt-4 border-t border-orange-100">
            Note: You can log in using these credentials once the community admin approves your request.
          </div>
        </div>

        <button onClick={onClose} className="relative w-full py-3.5 mt-8 rounded-full bg-gradient-to-r from-[#F25C05] to-[#FFA74D] hover:from-[#E14D02] hover:to-[#FF952B] hover:shadow-[0_12px_40px_rgba(242,92,5,0.45)] focus:outline-none text-white font-extrabold text-[15px] tracking-wide shadow-[0_8px_30px_rgba(242,92,5,0.3)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 group">
          Continue to login
        </button>
      </div>
    </div>
  );
}
