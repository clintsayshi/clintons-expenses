"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../utils/supabaseClient";
import { useAuth } from "../../../components/AuthProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

const emailSchema = z.object({
  email: z.email(),
  name: z.string().min(1, "Name is required"),
});

const otpSchema = z.object({
  otp: z.string().length(6),
});

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", name: "" },
  });

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const email = emailForm.watch("email");
  const name = emailForm.watch("name");

  const requestOtp = async (data: { email: string }) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        shouldCreateUser: true,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setStep("otp");
    }
  };

  async function resendOtp() {
    if (!email) throw new Error("Email is required");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // avoid creating new users accidentally
      },
    });

    if (error) throw error;

    setMessage("A new OTP has been sent to your email.");
  }

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
      //

      const { data, error } = await supabase.auth.getSession();

      // create user record /api/users
      if (error) {
        console.log(error.message);
      }

      if (data.session?.user) {
        console.log("creating user");

        // Create user record in the database
        const response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.session?.access_token}`,
          },
          body: JSON.stringify({
            id: data.session?.user.id,
            email: data.session?.user.email,
            name: name,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.log("Error creating user:", error);
        }

        if (response.ok) {
          const user = await response.json();
          console.log("User created successfully:", user);
          setMessage("User created successfully");
        }
      }

      router.push("/home");
    }
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
    <div className=" mx-auto max-w-md py-10 px-6 sm:py-32">
      <header>
        <h1>Sign Up</h1>
      </header>

      <div>
        {step === "email" && (
          <>
            <form onSubmit={emailForm.handleSubmit(requestOtp)}>
              <p className="text-gray-600 mb-5">
                Please enter your email and name to receive OTP.
              </p>
              <div className="flex flex-col mb-4">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  {...emailForm.register("email")}
                  placeholder="Enter your email"
                  required
                  className="border-gray-600 border px-2 py-1"
                />

                {emailForm.formState.errors.email && (
                  <div className="text-red-600 text-sm mt-2">
                    {emailForm.formState.errors.email.message}
                  </div>
                )}
              </div>

              <div className="flex flex-col mb-4">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  {...emailForm.register("name")}
                  placeholder="Enter your name"
                  required
                  className="border-gray-600 border px-2 py-1"
                />
                {emailForm.formState.errors.name && (
                  <div className="text-red-600 text-sm mt-2">
                    {emailForm.formState.errors.name.message}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={emailForm.formState.isSubmitting}
                className="w-full py-2 hover:bg-black hover:text-white border"
              >
                {emailForm.formState.isSubmitting ? "Sending..." : "Send OTP"}
              </button>

              {emailForm.formState.isSubmitSuccessful && (
                <div style={{ color: "green", marginTop: 12 }}>{message}</div>
              )}

              {!emailForm.formState.isSubmitSuccessful && (
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={resendOtp}
                    disabled={loading}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Resending..." : "Resend OTP"}
                  </button>
                  {message && (
                    <div style={{ color: "green", marginTop: 12 }}>
                      OTP sent! Check your email.
                    </div>
                  )}
                </div>
              )}
            </form>
          </>
        )}
        {step === "otp" && (
          <>
            <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)}>
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
                {otpForm.formState.isSubmitting ? "Verifying..." : "Verify OTP"}
              </button>

              {otpForm.formState.isSubmitSuccessful && (
                <div className="">Logged in successfully</div>
              )}
            </form>
          </>
        )}
        {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
}
