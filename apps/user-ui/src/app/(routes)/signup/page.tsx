"use client";

import { GoogleButton } from "@/components";
import { useMutation } from "@tanstack/react-query";
import axios, {AxiosError} from "axios";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";

type TFormData = {
  name: string;
  email: string;
  password: string;
}

const Signup = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userData, setUserData] = useState<TFormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const signupMutation = useMutation({
    mutationFn: async (data: TFormData) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/user-registration`, data);
      return response.data;
    },
    onSuccess: (_, formData) => {
      setUserData(formData);
      setShowOTP(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    }
  })

  const verifyOTPMutation = useMutation({
    mutationFn: async () => {
      if (!userData) return;
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/verify-user`, {
        ...userData,
        otp: otp.join('')
      });
      return response.data;
    },
    onSuccess: () => {
      router.push("/login");
    }
  })

  const onSubmit = (data: TFormData) => {
    signupMutation.mutate(data);
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
    if (userData) {
      signupMutation.mutate(userData);
    }
  }


  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Signup
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Signup
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="text-3xl font-semibold text-center mb-2">Signup to eShop</h3>
          <p className="text-center text-gray-500 mb-4">
            Already have an Account?
            <Link href={"/login"} className="text-[#3489ff]"> Sign In</Link>
          </p>

          <GoogleButton />

          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3">or Sign up with Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {!showOTP ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-2">
                <label className="block text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Shani Sharma"
                  className="w-full p-2 border border-gray-300 outline-0 mb-1"
                  {...register("name",
                    {required: "Name is required", }
                  )} />
                {errors.name && (
                  <p className="text-red-500 text-sm my-2">{String(errors.name.message)}</p>
                )}
              </div>

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

              <div className="mb-2">
                <label className="block text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text": "password"}
                    placeholder="Min. 6 characters"
                    className="w-full p-2 border border-gray-300 outline-0 mb-1"
                    {...register("password",
                      {required: "Password is required", minLength: {
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

              <button type="submit" disabled={signupMutation.isPending} className="w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg my-4">
                {signupMutation.isPending ? " Signing up...": "Signup"}
              </button>

            </form>
          ) : (
            <div>
              <h3 className="text-xl font-semibold text-center mb-4">Enter OTP</h3>
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
                    {verifyOTPMutation.error.response?.data?.message || verifyOTPMutation.error.message}
                  </p>
                )
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Signup;
