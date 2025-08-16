"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../utils/supabaseClient";
import { useAuth } from "../../../components/AuthProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

const emailSchema = z.object({
  email: z.email(),
});
const otpSchema = z.object({
  otp: z.string().length(6),
});

export default function SignupPage() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const router = useRouter();

  const {
    handleSubmit,
    formState: { isSubmitting, isSubmitSuccessful },
    watch,
    register,
  } = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const email = watch("email");

  // Request OTP
  const SendOtp = () => {
    const requestOtp = async (data: { email: string }) => {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          shouldCreateUser: false,
        },
      });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setStep("otp");
      }
    };

    return (
      <form onSubmit={handleSubmit(requestOtp)}>
        <div className="flex flex-col mb-4">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register("email")}
            placeholder="Enter your email"
            required
            className="border-gray-600 border px-2 py-1"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 hover:bg-black hover:text-white border"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>

        {isSubmitSuccessful && (
          <div style={{ color: "green", marginTop: 12 }}>
            OTP sent! Check your email.
          </div>
        )}
      </form>
    );
  };

  // Verify OTP
  const VerifyOtp = () => {
    const {
      handleSubmit,
      formState: { isSubmitting, isSubmitSuccessful },
      register,
    } = useForm({
      resolver: zodResolver(otpSchema),
      defaultValues: { otp: "" },
    });

    const handleVerifyOtp = async (data: { otp: string }) => {
      setError(null);

      const { error } = await supabase.auth.verifyOtp({
        email: email,
        token: data.otp,
        type: "email",
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/home");
      }
    };

    return (
      <form onSubmit={handleSubmit(handleVerifyOtp)}>
        <div className="flex flex-col mb-4">
          <label htmlFor="otp">Enter One Time Pin</label>
          <input
            id="otp"
            type="text"
            placeholder="Enter OTP from email"
            {...register("otp")}
            required
            className="border-gray-600 border px-2 py-1"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 hover:bg-black hover:text-white border"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Verifying..." : "Verify OTP"}
        </button>

        {isSubmitSuccessful && <div className="">Logged in successfully</div>}
      </form>
    );
  };

  useEffect(() => {
    if (user) {
      router.push("/home");
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 32 }}>
      <h2>Sign Up / Log In</h2>
      {step === "email" && <SendOtp />}
      {step === "otp" && <VerifyOtp />}
      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
    </div>
  );
}
