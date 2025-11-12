"use client";

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type TFormData = {
  email: string;
  password: string;
}

const ForgotPassword = () => {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [serverError, setServerError] = useState<string|null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<TFormData>();

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      })
    }, 1000);
  }

  const requestOTPMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/user-forgot-password`, {email});
      return response.data
    },
    onSuccess: (_, {email}) => {
      setServerError(null);
      setUserEmail(email);
      setStep("otp");
      setCanResend(false);
      startResendTimer();
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as { message?: string })?.message || "Invalid OTP. Try again later!";
      setServerError(errorMessage);
    }
  })

  const verifyOTPMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) return;
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/verify-user-forgot-password`, { email: userEmail, otp: otp.join("") });
      return response.data;
    },
    onSuccess: () => {
      setStep("reset");
      setServerError(null);
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as { message?: string })?.message || "Invalid OTP. Try again later!";
      setServerError(errorMessage);
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({password}: { password: string }) => {
      if (!password) return;
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/user-reset-password`, { email: userEmail, newPassword:password });
      return response.data;
    },
    onSuccess: () => {
      setStep("email");
      toast.success("Password reset successfully!");
      setServerError(null);
      router.push("/login");
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as { message?: string })?.message || "Failed to reset password. Try again later!";
      setServerError(errorMessage);
    }
  })

  const onSubmitEmail = ({email}: { email: string }) => {
    requestOTPMutation.mutate({email});
  }

  const onSubmitPassword = ({password}: { password: string }) => {
    resetPasswordMutation.mutate({password});
  }

  const handleOTPChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < inputRefs.current.length -1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  const handleOTPKeydown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  const resendOTP = () => {
    if (userEmail) {
      requestOTPMutation.mutate({email: userEmail});
    }
  }

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Forgot Password
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Forgot Password
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          {step === "email" && (
            <>
              <h3 className="text-3xl font-semibold text-center mb-2">Login to eShop</h3>
              <p className="text-center text-gray-500 mb-4">
                Go back to
                <Link href={"/login"} className="text-[#3489ff]"> Login</Link>
              </p>

              <form onSubmit={handleSubmit(onSubmitEmail)}>
                <div className="mb-2">
                  <label className="block text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="support@shanisharma.com"
                    className="w-full p-2 border border-gray-300 outline-0 mb-1"
                    {...register("email",
                      {required: "Email is required", pattern: {
                        value: /^[a-zA-Z-0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                        message: "Invalid email address",
                      }}
                    )} />
                  {errors.email && (
                    <p className="text-red-500 text-sm my-2">{String(errors.email.message)}</p>
                  )}
                </div>

                <button
                    type="submit"
                    className="w-full text-lg cursor-pointer bg-black text-white py-2 my-4 rounded-lg"
                    disabled={requestOTPMutation.isPending}
                >
                  {requestOTPMutation.isPending ? "Sending Mail...": "Submit"}
                </button>

                {serverError && (
                  <p className="text-red-500 text-sm my-2">{String(serverError)}</p>
                )}
              </form>
            </>
          )}

          {step === "otp" && (
            <div>
              <h3 className="text-xl font-semibold text-center mb-4">
                Enter OTP
              </h3>
              <div className="flex justify-center gap-6">
                {otp?.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    ref={(el) => {
                    if (el) inputRefs.current[index] = el;
                  }}
                    maxLength={1}
                    className="w-12 h-12 text-center border border-gray-300 outline-none !rounded"
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleOTPKeydown(index, e)}
                  />
                ))}
              </div>
              <button
                className="w-full my-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg"
                disabled={verifyOTPMutation.isPending}
                onClick={() => verifyOTPMutation.mutate()}
              >
                {verifyOTPMutation.isPending ? "Verifying..." : "Verify OTP"}
              </button>
              <p className="text-center text-sm mt-4">
                {canResend ? (
                  <button
                    className="text-blue-500 cursor-pointer"
                    onClick={resendOTP}
                  >
                    Resend OTP
                  </button>
                ) : (
                  `Resend OTP in ${timer} seconds`
                )}
              </p>
              {
                verifyOTPMutation?.isError && verifyOTPMutation.error instanceof AxiosError && (
                  <p className="text-red-500 text-sm mt-2">
                    {verifyOTPMutation.error.message}
                  </p>
                )
              }
            </div>
          )}

          {step === "reset" && (
            <>
              <h3>
                Reset Password
              </h3>
              <form onSubmit={handleSubmit(onSubmitPassword)}>
                <div className="mb-2">
                  <label className="block text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={passwordVisible ? "text": "password"}
                      placeholder="Enter new password"
                      className="w-full p-2 border border-gray-300 outline-0 mb-1"
                      {...register("password",
                        {required: "new Password is required", minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        }}
                      )} />
                      <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                        {passwordVisible ? <EyeIcon /> : <EyeOffIcon />}
                      </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm my-2">{String(errors.password.message)}</p>
                  )}
                </div>

                <button type="submit" disabled={resetPasswordMutation.isPending} className="w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg my-4">
                  {resetPasswordMutation.isPending ? " Signing up...": "Signup"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword;
