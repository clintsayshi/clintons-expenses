"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  //const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const {
    handleSubmit,
    formState: { isSubmitting, isSubmitSuccessful },
    setError,
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

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          shouldCreateUser: false,
        },
      });
      setLoading(false);
      if (error) {
        setError("email", {
          type: "manual",
          message: "Error requesting OTP, Try again later!",
        });
      } else {
        setStep("otp");
      }
    };

    return (
      <form onSubmit={handleSubmit(requestOtp)}>
        <p className="text-gray-600 mb-5">
          Please enter your email and name to receive OTP.
        </p>

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

        {!isSubmitSuccessful && (
          <div className="">Failed to log in. Try again later!</div>
        )}
      </form>
    );
  };

  // Verify OTP
  const VerifyOtp = () => {
    const otpForm = useForm({
      resolver: zodResolver(otpSchema),
      defaultValues: { otp: "" },
    });

    const handleVerifyOtp = async (data: { otp: string }) => {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email: email,
        token: data.otp,
        type: "email",
      });

      if (error) {
        otpForm.setError("otp", {
          type: "manual",
          message: "Error verifying OTP, Try again later!",
        });
      } else {
        router.push("/expenses");
      }
    };

    return (
      <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)}>
        <p className="text-gray-600 mb-5">
          Please enter your email and name to receive OTP.
        </p>

        <div className="flex flex-col mb-4">
          <label htmlFor="otp">Enter One Time Pin</label>
          <input
            id="otp"
            type="text"
            placeholder="Enter OTP from email"
            {...otpForm.register("otp")}
            required
            className="border-gray-600 border px-2 py-1"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 hover:bg-black hover:text-white border"
          disabled={otpForm.formState.isSubmitting}
        >
          {isSubmitting ? "Verifying..." : "Verify OTP"}
        </button>

        {otpForm.formState.isSubmitSuccessful && (
          <div className="">Logged in successfully</div>
        )}

        {!otpForm.formState.isSubmitSuccessful && (
          <div className="">Failed to log in. Try again later!</div>
        )}
      </form>
    );
  };

  return (
    <div className=" mx-auto max-w-md py-10 px-6 sm:py-32">
      <header>
        <h1>Log in</h1>
      </header>

      <div>
        {step === "email" && <SendOtp />}
        {step === "otp" && <VerifyOtp />}
      </div>
    </div>
  );
}
