"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // TODO: Implement password reset logic
      // For now, just simulate the request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitted(true);
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative h-20 w-20">
              <Image 
                src="/logo.png" 
                alt="ChamaSmart Logo" 
                fill
                className="object-contain"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>
            {submitted 
              ? "Check your email for reset instructions" 
              : "Enter your email to receive password reset instructions"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <Mail className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We've sent password reset instructions to:
                </p>
                <p className="font-medium text-gray-900 dark:text-white">{email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setSubmitted(false)}
              >
                Try another email
              </Button>
              <Link href="/auth/signin" className="block">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-md">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Instructions"}
              </Button>
              <Link href="/auth/signin" className="block">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </Link>
            </form>
          )}
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> Password reset functionality is currently under development. 
              Please contact your system administrator for password assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
