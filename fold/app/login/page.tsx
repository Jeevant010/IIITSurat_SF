"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Chrome, Gamepad2, Users, Trophy, Zap } from "lucide-react";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/profile/complete" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-purple-950 to-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-purple-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-pink-600/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/25">
            <Gamepad2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Spring Fiesta 2026
          </h1>
          <p className="text-zinc-400">IIIT Surat's Premier Gaming Event</p>
        </div>

        {/* Login Card */}
        <Card className="border-purple-500/20 bg-zinc-950/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-white">
              Join the Battle
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Sign in with your Google account to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Features */}
            <div className="grid grid-cols-3 gap-3 py-4">
              <div className="text-center">
                <div className="mx-auto w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-xs text-zinc-500">Create Teams</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-xs text-zinc-500">Compete</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-xs text-zinc-500">Win Prizes</p>
              </div>
            </div>

            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleLogin}
              className="w-full h-14 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-lg rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Chrome className="w-6 h-6 mr-3" />
              Continue with Google
            </Button>

            {/* Info */}
            <p className="text-center text-xs text-zinc-500">
              By signing in, you agree to participate in Spring Fiesta 2026.
              <br />
              Use your <span className="text-purple-400">
                @iiitsurat.ac.in
              </span>{" "}
              email for best experience.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-600">
          Having trouble? Contact{" "}
          <a
            href="mailto:support@iiitsurat.ac.in"
            className="text-purple-400 hover:underline"
          >
            support@iiitsurat.ac.in
          </a>
        </p>
      </div>
    </div>
  );
}
