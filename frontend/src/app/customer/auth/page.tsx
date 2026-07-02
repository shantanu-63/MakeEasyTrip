"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useData } from "@/context/DataContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { User, Mail, Phone, LogIn, UserPlus } from "lucide-react";

function TravelerAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "dashboard";

  const { loginUser, activeUser, addLog } = useData();

  const [activePanel, setActivePanel] = useState<"login" | "signup" | "forgot" | "otp" | "reset">("login");
  const [alertText, setAlertText] = useState("");
  const [alertType, setAlertType] = useState<"info" | "error" | "success">("info");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup fields
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupTerms, setSignupTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("None");
  const [passwordStrengthFill, setPasswordStrengthFill] = useState("0%");

  // Forgot / OTP / Reset fields
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpVal, setOtpVal] = useState(["", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(120);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

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

  /* ─── Shared button classes ─── */
  const orangeBtnClass =
    "w-full h-[52px] rounded-xl text-white font-semibold text-[15px] flex items-center justify-center gap-2 cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]";
  const orangeBtnStyle = {
    background: "linear-gradient(135deg, #FF7A00, #FF4D00)",
  };

  return (
    <section id="traveler-auth-view" className="block">
      <div className="auth-container flex justify-center items-center px-4 py-12 min-h-[calc(100vh-200px)]">
        <div className="auth-card bg-white rounded-2xl shadow-xl w-full max-w-[480px] p-8 sm:p-10">
          {/* Global Alert */}
          {alertText && (
            <div
              className={`p-3 rounded-xl mb-6 text-[13px] font-semibold flex items-center gap-2 ${
                alertType === "error"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : alertType === "success"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-blue-50 text-blue-600 border border-blue-200"
              }`}
            >
              <i className="fa-solid fa-circle-info"></i>
              <span>{alertText}</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* 1. LOGIN PANEL                             */}
          {/* ═══════════════════════════════════════════ */}
          {activePanel === "login" && (
            <div className="auth-panel active-panel" id="auth-panel-login">
              <div className="text-center mb-8">
                <h2 className="text-[26px] font-extrabold text-[#0A225C]">Welcome Back</h2>
                <p className="text-[13px] text-[#64748B] mt-1">
                  Sign in to your account to manage bookings &amp; rewards
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
                <Input
                  label="Email / Mobile Number"
                  type="text"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="siddharth.patil@gmail.com"
                  rightIcon={<Mail className="w-[18px] h-[18px]" />}
                />
                <Input
                  label="Password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                />

                {/* Remember Me / Forgot Password */}
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[13px] text-[#0F172A]">
                    <input
                      type="checkbox"
                      id="login-remember"
                      className="accent-orange-500 w-4 h-4 cursor-pointer rounded"
                    />
                    Remember Me
                  </label>
                  <button
                    type="button"
                    onClick={() => setActivePanel("forgot")}
                    className="text-[13px] font-semibold text-[#F97316] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login Button */}
                <button type="submit" className={orangeBtnClass} style={orangeBtnStyle}>
                  <LogIn className="w-5 h-5" />
                  Login Securely
                </button>
              </form>

              {/* OR SIGN IN WITH divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-[#E2E8F0]"></div>
                <span className="text-[12px] text-[#64748B] font-semibold uppercase tracking-wider whitespace-nowrap">
                  Or Sign In With
                </span>
                <div className="flex-1 h-px bg-[#E2E8F0]"></div>
              </div>

              {/* Social buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 h-11 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center gap-2 text-[13px] font-semibold text-[#0A225C] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <i className="fa-brands fa-google text-[16px]"></i>
                  Google
                </button>
                <button
                  type="button"
                  className="flex-1 h-11 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center gap-2 text-[13px] font-semibold text-[#0A225C] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <i className="fa-brands fa-facebook-f text-[16px]"></i>
                  Facebook
                </button>
              </div>

              <p className="text-center text-[13px] text-[#64748B] mt-6">
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => setActivePanel("signup")}
                  className="text-[#F97316] font-bold hover:underline"
                >
                  Create Account
                </button>
              </p>
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* 2. SIGNUP PANEL                            */}
          {/* ═══════════════════════════════════════════ */}
          {activePanel === "signup" && (
            <div className="auth-panel active-panel" id="auth-panel-signup">
              <div className="text-center mb-8">
                <h2 className="text-[26px] font-extrabold text-[#0A225C]">Create Account</h2>
                <p className="text-[13px] text-[#64748B] mt-1">
                  Join Make Easy Trip to unlock premium travel deals
                </p>
              </div>

              <form onSubmit={handleSignupSubmit} className="flex flex-col gap-5">
                <Input
                  label="Full Name"
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Siddharth Patil"
                  rightIcon={<User className="w-[18px] h-[18px]" />}
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="siddharth.patil@gmail.com"
                  rightIcon={<Mail className="w-[18px] h-[18px]" />}
                />
                <Input
                  label="Mobile Number"
                  type="tel"
                  required
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  rightIcon={<Phone className="w-[18px] h-[18px]" />}
                />

                {/* Password with strength bar */}
                <div className="flex flex-col gap-1.5 w-full">
                  <Input
                    label="Password"
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => {
                      setSignupPassword(e.target.value);
                      checkStrength(e.target.value);
                    }}
                    placeholder="Enter password"
                  />
                  <div className="mt-1">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: passwordStrengthFill,
                          backgroundColor:
                            passwordStrength === "Weak"
                              ? "#EF4444"
                              : passwordStrength === "Fair"
                              ? "#F59E0B"
                              : passwordStrength === "Good"
                              ? "#3B82F6"
                              : passwordStrength === "Strong"
                              ? "#10B981"
                              : "#E2E8F0",
                        }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-[#64748B] font-semibold uppercase mt-1 block">
                      Password Strength: {passwordStrength}
                    </span>
                  </div>
                </div>

                <Input
                  label="Confirm Password"
                  type="password"
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                />

                {/* Terms checkbox */}
                <div className="text-[13px] text-[#0F172A]">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={signupTerms}
                      onChange={(e) => setSignupTerms(e.target.checked)}
                      className="accent-orange-500 w-4 h-4 mt-0.5 cursor-pointer flex-shrink-0"
                    />
                    <span className="leading-snug">
                      I agree to the{" "}
                      <Link href="#" className="text-[#F97316] font-bold hover:underline">
                        Terms of Services
                      </Link>{" "}
                      &amp;{" "}
                      <Link href="#" className="text-[#F97316] font-bold hover:underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </div>

                {/* Register Button */}
                <button type="submit" className={orangeBtnClass} style={orangeBtnStyle}>
                  <UserPlus className="w-5 h-5" />
                  Register Account
                </button>
              </form>

              <p className="text-center text-[13px] text-[#64748B] mt-6">
                Already have an account?{" "}
                <button
                  onClick={() => setActivePanel("login")}
                  className="text-[#F97316] font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* 3. FORGOT PASSWORD PANEL                   */}
          {/* ═══════════════════════════════════════════ */}
          {activePanel === "forgot" && (
            <div className="auth-panel active-panel" id="auth-panel-forgot">
              <div className="text-center mb-8">
                <h2 className="text-[26px] font-extrabold text-[#0A225C]">Reset Password</h2>
                <p className="text-[13px] text-[#64748B] mt-1">
                  Enter your registered credential to receive a secure OTP code
                </p>
              </div>
              <form onSubmit={handleForgotSubmit} className="flex flex-col gap-5">
                <Input
                  label="Email or Mobile Number"
                  type="text"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter email or mobile"
                  rightIcon={<Mail className="w-[18px] h-[18px]" />}
                />
                <button type="submit" className={orangeBtnClass} style={orangeBtnStyle}>
                  Send Verification OTP
                </button>
              </form>
              <p className="text-center text-[13px] text-[#64748B] mt-6">
                Remember password?{" "}
                <button
                  onClick={() => setActivePanel("login")}
                  className="text-[#F97316] font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* 4. OTP VERIFICATION PANEL                  */}
          {/* ═══════════════════════════════════════════ */}
          {activePanel === "otp" && (
            <div className="auth-panel active-panel" id="auth-panel-otp">
              <div className="text-center mb-8">
                <h2 className="text-[26px] font-extrabold text-[#0A225C]">Verify OTP</h2>
                <p className="text-[13px] text-[#64748B] mt-1">
                  We have sent a 4-digit code to your credential. Enter code &apos;1234&apos; to verify.
                </p>
              </div>
              <form onSubmit={handleOtpSubmit} className="flex flex-col gap-5">
                <div className="flex justify-center gap-4">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      id={`otp-${idx + 1}`}
                      className="w-[52px] h-[52px] rounded-xl bg-[#F1F5FF] text-center font-bold text-xl text-[#0A225C] outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                      value={otpVal[idx]}
                      onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                      required
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[13px] font-semibold text-[#64748B]">
                  <span>
                    Code Expires:{" "}
                    <strong className="text-[#0A225C] font-extrabold">
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
                    className={`font-bold ${
                      otpTimer > 0 ? "text-slate-300 cursor-not-allowed" : "text-[#F97316] hover:underline cursor-pointer"
                    }`}
                  >
                    Resend Code
                  </button>
                </div>
                <button type="submit" className={orangeBtnClass} style={orangeBtnStyle}>
                  Verify Code
                </button>
              </form>
              <p className="text-center text-[13px] text-[#64748B] mt-6">
                Back to{" "}
                <button
                  onClick={() => setActivePanel("login")}
                  className="text-[#F97316] font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* 5. RESET PASSWORD PANEL                    */}
          {/* ═══════════════════════════════════════════ */}
          {activePanel === "reset" && (
            <div className="auth-panel active-panel" id="auth-panel-reset">
              <div className="text-center mb-8">
                <h2 className="text-[26px] font-extrabold text-[#0A225C]">Set New Password</h2>
                <p className="text-[13px] text-[#64748B] mt-1">
                  Create a strong password for your account
                </p>
              </div>
              <form onSubmit={handleResetSubmit} className="flex flex-col gap-5">
                <Input
                  label="New Password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                <button type="submit" className={orangeBtnClass} style={orangeBtnStyle}>
                  Reset Password
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
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-[13px] text-[#64748B]">Loading authentication...</p>
        </div>
      }
    >
      <TravelerAuthContent />
    </Suspense>
  );
}
