'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LockKeyhole, Mail } from "lucide-react";
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      console.log(process.env.NEXT_PUBLIC_API_BASE_URL)
      const res = await axios.post(
  `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/login`,
  { email, password },
  { headers: { 'Content-Type': 'application/json' } }
);
      
      if (res.data.success) {
        // Store token in localStorage/sessionStorage
        if (rememberMe) {
          localStorage.setItem('adminToken', res.data.token);
        } else {
          sessionStorage.setItem('adminToken', res.data.token);
        }
        router.push('/dashboard');
      } else {
        setErrorMsg(res.data.message);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md">
        {/* Header */}
        <div className="bg-black text-white py-10 px-8 text-center">
          <h1 className="text-3xl font-light tracking-wider">ADMIN PORTAL</h1>
          <p className="text-gray-300 mt-2 text-sm">
            Secure access to dashboard
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10 py-5 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockKeyhole className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 py-5 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Remember Me */}
               <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Checkbox 
          id="remember" 
          checked={rememberMe}
          onCheckedChange={() => setRememberMe(!rememberMe)}
          className="border-gray-300" 
        />
        <Label htmlFor="remember" className="ml-2 text-sm text-gray-600">
          Remember me
        </Label>
      </div>
    </div>

            {/* Error Message */}
            {errorMsg && (
              <p className="text-red-500 text-sm">{errorMsg}</p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-6 bg-black hover:bg-gray-800 text-white rounded-lg transition duration-300 shadow-lg"
            >
              SIGN IN
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-8">
            © 2023 Admin Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
