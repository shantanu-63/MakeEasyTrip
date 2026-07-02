"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useData } from "@/context/DataContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function TravelerAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "dashboard";

  const { loginUser, activeUser, addLog } = useData();

  const [activePanel, setActivePanel] = useState<"login" | "signup" | "forgot" | "otp" | "reset">("login");
  const [alertText, setAlertText] = useState("");
  const [alertType, setAlertType] = useState<"info" | "error" | "success">("info");

  // Form Fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupTerms, setSignupTerms] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("None");
  const [passwordStrengthFill, setPasswordStrengthFill] = useState("0%");

  const [forgotEmail, setForgotEmail] = useState("");
  const [otpVal, setOtpVal] = useState(["", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(120);

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  useEffect(() => {
    if (activeUser) {
      router.push(`/customer/${redirect}`);
    }
  }, [activeUser, router, redirect]);

  // OTP Timer countdown
  useEffect(() => {
    if (activePanel !== "otp" || otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activePanel, otpTimer]);

  const triggerAlert = (text: string, type: "info" | "error" | "success" = "info") => {
    setAlertText(text);
    setAlertType(type);
    setTimeout(() => {
      setAlertText("");
    }, 6000);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    // Local authentication checks matching seed Siddharth Patil
    if (loginEmail === "siddharth.patil@gmail.com" && loginPassword === "Password123") {
      loginUser(loginEmail, "Siddharth Patil");
      triggerAlert("Login successful!", "success");
      return;
    }

    // Checking localStorage registered users
    const users = JSON.parse(localStorage.getItem("met_users") || "[]");
    const matched = users.find((u: any) => u.email === loginEmail);

    if (matched) {
      // In a mock setup we bypass cryptography checks for simplicity or mock it
      loginUser(matched.email, matched.fullName);
      triggerAlert("Login successful!", "success");
    } else {
      triggerAlert("Invalid email/phone or password combination.", "error");
      addLog(`SECURITY_ALERT: Failed login attempt for ${loginEmail}`);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      triggerAlert("Passwords do not match.", "error");
      return;
    }
    if (signupPassword.length < 8) {
      triggerAlert("Password must be at least 8 characters.", "error");
      return;
    }

    const users = JSON.parse(localStorage.getItem("met_users") || "[]");
    if (users.some((u: any) => u.email === signupEmail)) {
      triggerAlert("Email address is already registered.", "error");
      return;
    }

    const newUser = {
      id: "user-" + Math.floor(Math.random() * 9000 + 1000),
      fullName: signupName,
      email: signupEmail,
      phone: signupPhone,
      role: "traveler",
      wishlist: [],
      bookings: [],
    };

    users.push(newUser);
    localStorage.setItem("met_users", JSON.stringify(users));

    addLog(`USER_REGISTRATION: Registered account: ${signupEmail}`);
    loginUser(signupEmail, signupName);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    // Start OTP panel
    setOtpTimer(120);
    setActivePanel("otp");
    addLog(`OTP_VERIFY: Sent mock verification OTP to ${forgotEmail}`);
    triggerAlert("OTP verification code sent!", "success");
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const joined = otpVal.join("");
    if (joined === "1234") {
      setActivePanel("reset");
      addLog(`OTP_VERIFY: Successfully verified credentials via OTP`);
    } else {
      triggerAlert("Invalid OTP code entered. Use code '1234' to verify.", "error");
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      triggerAlert("Passwords do not match.", "error");
      return;
    }

    triggerAlert("Password reset successfully! Please log in.", "success");
    setActivePanel("login");
    addLog("PASSWORD_RESET: Customer credentials updated.");
  };

  const checkStrength = (val: string) => {
    if (!val) {
      setPasswordStrength("None");
      setPasswordStrengthFill("0%");
      return;
    }
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^a-zA-Z0-9]/.test(val)) score++;

    if (score <= 1) {
      setPasswordStrength("Weak");
      setPasswordStrengthFill("25%");
    } else if (score === 2) {
      setPasswordStrength("Fair");
      setPasswordStrengthFill("50%");
    } else if (score === 3) {
      setPasswordStrength("Good");
      setPasswordStrengthFill("75%");
    } else {
      setPasswordStrength("Strong");
      setPasswordStrengthFill("100%");
    }
  };

  const handleOtpBoxChange = (idx: number, val: string) => {
    const nextVal = [...otpVal];
    nextVal[idx] = val.substring(0, 1);
    setOtpVal(nextVal);

    // Auto-focus next input
    if (val && idx < 3) {
      const nextInput = document.getElementById(`otp-${idx + 2}`);
      nextInput?.focus();
    }
  };

  const formatTimer = () => {
    const mins = Math.floor(otpTimer / 60);
    const secs = otpTimer % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <section id="traveler-auth-view" className="traveler-subview block">
      <div className="container auth-container px-6 py-12 flex justify-center">
        <div className="auth-card bg-white p-8 border border-border rounded-lg shadow-md max-w-md w-full">
          {/* Global Alert */}
          {alertText && (
            <div
              className={`auth-global-banner p-3 rounded mb-6 text-xs font-semibold flex items-center gap-2 ${
                alertType === "error"
                  ? "bg-red-50 text-red-600 border border-red-150"
                  : alertType === "success"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-150"
                  : "bg-blue-50 text-blue-600 border border-blue-150"
              }`}
            >
              <i className="fa-solid fa-circle-info"></i>
              <span>{alertText}</span>
            </div>
          )}

          {/* 1. LOGIN PANEL */}
          {activePanel === "login" && (
            <div className="auth-panel active-panel" id="auth-panel-login">
              <div className="auth-header mb-6">
                <h2 className="auth-title text-xl font-extrabold text-primary">Welcome Back</h2>
                <p className="auth-subtitle text-[11px] text-text-muted mt-1">
                  Sign in to your account to manage bookings & rewards
                </p>
              </div>
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                <div className="form-group flex flex-col gap-1.5 mb-4">
                  <label className="text-[10px] text-text-muted font-bold uppercase">
                    Email / Mobile Number
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none z-10"></i>
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E14] focus:border-transparent transition-all"
                      placeholder="siddharth.patil@gmail.com"
                    />
                  </div>
                </div>
                <div className="form-group flex flex-col gap-1.5 mb-4">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Password</label>
                  <div className="relative">
                    <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none z-10"></i>
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full h-14 pl-12 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E14] focus:border-transparent transition-all"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors z-10 flex items-center justify-center"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      <i className={`fa-solid ${showLoginPassword ? "fa-eye-slash" : "fa-eye"} text-sm`}></i>
                    </button>
                  </div>
                </div>
                <div className="form-checkbox-row flex justify-between items-center text-[10px] text-text-main">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" id="login-remember" /> Remember Me
                  </label>
                  <button
                    type="button"
                    onClick={() => setActivePanel("forgot")}
                    className="forgot-password-link text-secondary font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <button type="submit" className="btn-primary w-full justify-center py-2.5 text-xs">
                  <i className="fa-solid fa-right-to-bracket mr-1.5"></i> Login Securely
                </button>
              </form>
              <p className="auth-toggle-tip text-center text-xs mt-6">
                Don't have an account?{" "}
                <button
                  onClick={() => setActivePanel("signup")}
                  className="text-secondary font-bold hover:underline"
                >
                  Create Account
                </button>
              </p>
            </div>
          )}

          {/* 2. SIGNUP PANEL */}
          {activePanel === "signup" && (
            <div className="auth-panel active-panel" id="auth-panel-signup">
              <div className="auth-header mb-6">
                <h2 className="auth-title text-xl font-extrabold text-primary">Create Account</h2>
                <p className="auth-subtitle text-[11px] text-text-muted mt-1">
                  Join Make Easy Trip to unlock premium travel deals
                </p>
              </div>
              <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
                <div className="form-group flex flex-col gap-1.5 mb-4">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Full Name</label>
                  <div className="relative">
                    <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none z-10"></i>
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E14] focus:border-transparent transition-all"
                      placeholder="Siddharth Patil"
                    />
                  </div>
                </div>
                <div className="form-group flex flex-col gap-1.5 mb-4">
                  <label className="text-[10px] text-text-muted font-bold uppercase">
                    Email Address
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none z-10"></i>
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E14] focus:border-transparent transition-all"
                      placeholder="siddharth.patil@gmail.com"
                    />
                  </div>
                </div>
                <div className="form-group flex flex-col gap-1.5 mb-4">
                  <label className="text-[10px] text-text-muted font-bold uppercase">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none z-10"></i>
                    <input
                      type="tel"
                      required
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E14] focus:border-transparent transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
                <div className="form-group flex flex-col gap-1.5 mb-4">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Password</label>
                  <div className="relative">
                    <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none z-10"></i>
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      required
                      value={signupPassword}
                      onChange={(e) => {
                        setSignupPassword(e.target.value);
                        checkStrength(e.target.value);
                      }}
                      className="w-full h-14 pl-12 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E14] focus:border-transparent transition-all"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors z-10 flex items-center justify-center"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                    >
                      <i className={`fa-solid ${showSignupPassword ? "fa-eye-slash" : "fa-eye"} text-sm`}></i>
                    </button>
                  </div>
                  <div className="strength-indicator-box mt-1.5">
                    <div className="strength-bar bg-slate-100 h-1.5 rounded overflow-hidden">
                      <div
                        className="strength-fill bg-secondary h-full transition-all duration-300"
                        style={{ width: passwordStrengthFill }}
                      ></div>
                    </div>
                    <span className="strength-label text-[9px] text-text-muted mt-1 block">
                      Password Strength: {passwordStrength}
                    </span>
                  </div>
                </div>
                <div className="form-group flex flex-col gap-1.5 mb-4">
                  <label className="text-[10px] text-text-muted font-bold uppercase">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none z-10"></i>
                    <input
                      type={showSignupConfirmPassword ? "text" : "password"}
                      required
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      className="w-full h-14 pl-12 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E14] focus:border-transparent transition-all"
                      placeholder="Re-enter password"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors z-10 flex items-center justify-center"
                      onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                    >
                      <i className={`fa-solid ${showSignupConfirmPassword ? "fa-eye-slash" : "fa-eye"} text-sm`}></i>
                    </button>
                  </div>
                </div>
                <div className="form-checkbox-row text-[10px] text-text-main mt-1">
                  <label className="flex items-start gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={signupTerms}
                      onChange={(e) => setSignupTerms(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>
                      I agree to the{" "}
                      <Link href="#" className="text-secondary font-bold hover:underline">
                        Terms of Services
                      </Link>{" "}
                      &{" "}
                      <Link href="#" className="text-secondary font-bold hover:underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </div>
                <button type="submit" className="btn-primary w-full justify-center py-2.5 text-xs">
                  <i className="fa-solid fa-user-plus mr-1.5"></i> Register Account
                </button>
              </form>
              <p className="auth-toggle-tip text-center text-xs mt-6">
                Already have an account?{" "}
                <button
                  onClick={() => setActivePanel("login")}
                  className="text-secondary font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          )}

          {/* 3. FORGOT PASSWORD PANEL */}
          {activePanel === "forgot" && (
            <div className="auth-panel active-panel" id="auth-panel-forgot">
              <div className="auth-header mb-6">
                <h2 className="auth-title text-xl font-extrabold text-primary">Reset Password</h2>
                <p className="auth-subtitle text-[11px] text-text-muted mt-1">
                  Enter your registered credential to receive a secure OTP code
                </p>
              </div>
              <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
                <div className="form-group flex flex-col gap-1.5 mb-4">
                  <label className="text-[10px] text-text-muted font-bold uppercase">
                    Email or Mobile Number
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none z-10"></i>
                    <input
                      type="text"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E14] focus:border-transparent transition-all"
                      placeholder="Enter email or mobile"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full justify-center py-2.5 text-xs">
                  <i className="fa-solid fa-paper-plane mr-1.5"></i> Send Verification OTP
                </button>
              </form>
              <p className="auth-toggle-tip text-center text-xs mt-6">
                Remember password?{" "}
                <button
                  onClick={() => setActivePanel("login")}
                  className="text-secondary font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          )}

          {/* 4. OTP VERIFICATION PANEL */}
          {activePanel === "otp" && (
            <div className="auth-panel active-panel" id="auth-panel-otp">
              <div className="auth-header mb-6">
                <h2 className="auth-title text-xl font-extrabold text-primary">Verify OTP</h2>
                <p className="auth-subtitle text-[11px] text-text-muted mt-1">
                  We have sent a 4-digit code to your credential. Enter code '1234' to verify.
                </p>
              </div>
              <form onSubmit={handleOtpSubmit} className="flex flex-col gap-5">
                <div className="otp-input-row flex justify-center gap-4">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      id={`otp-${idx + 1}`}
                      className="otp-box w-12 h-12 border-2 border-border text-center font-bold text-lg rounded outline-none focus:border-secondary"
                      value={otpVal[idx]}
                      onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                      required
                    />
                  ))}
                </div>
                <div className="otp-timer-row flex justify-between text-[11px] text-text-main font-semibold">
                  <span>
                    Code Expires:{" "}
                    <strong className="otp-timer-count text-secondary font-extrabold">
                      {formatTimer()}
                    </strong>
                  </span>
                  <button
                    type="button"
                    disabled={otpTimer > 0}
                    onClick={() => {
                      setOtpTimer(120);
                      triggerAlert("OTP code resent!", "success");
                    }}
                    className={`otp-resend-btn font-bold ${
                      otpTimer > 0 ? "text-slate-350 cursor-not-allowed" : "text-secondary hover:underline"
                    }`}
                  >
                    Resend Code
                  </button>
                </div>
                <button type="submit" className="btn-primary w-full justify-center py-2.5 text-xs">
                  <i className="fa-solid fa-shield-halved mr-1.5"></i> Verify Code
                </button>
              </form>
              <p className="auth-toggle-tip text-center text-xs mt-6">
                Back to{" "}
                <button
                  onClick={() => setActivePanel("login")}
                  className="text-secondary font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          )}

          {/* 5. RESET PASSWORD PANEL */}
          {activePanel === "reset" && (
            <div className="auth-panel active-panel" id="auth-panel-reset">
              <div className="auth-header mb-6">
                <h2 className="auth-title text-xl font-extrabold text-primary">Set New Password</h2>
                <p className="auth-subtitle text-[11px] text-text-muted mt-1">
                  Create a strong password for your account
                </p>
              </div>
              <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
                <div className="form-group flex flex-col gap-1.5 mb-4">
                  <label className="text-[10px] text-text-muted font-bold uppercase">
                    New Password
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none z-10"></i>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-14 pl-12 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E14] focus:border-transparent transition-all"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors z-10 flex items-center justify-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <i className={`fa-solid ${showNewPassword ? "fa-eye-slash" : "fa-eye"} text-sm`}></i>
                    </button>
                  </div>
                </div>
                <div className="form-group flex flex-col gap-1.5 mb-4">
                  <label className="text-[10px] text-text-muted font-bold uppercase">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none z-10"></i>
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full h-14 pl-12 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E14] focus:border-transparent transition-all"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors z-10 flex items-center justify-center"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    >
                      <i className={`fa-solid ${showConfirmNewPassword ? "fa-eye-slash" : "fa-eye"} text-sm`}></i>
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full justify-center py-2.5 text-xs">
                  <i className="fa-solid fa-key mr-1.5"></i> Reset Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function TravelerAuthPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "80px 24px", textAlign: "center" }}><p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Loading authentication...</p></div>}>
      <TravelerAuthContent />
    </Suspense>
  );
}
