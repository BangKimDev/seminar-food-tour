
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Lock, User } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin, isLoading: externalLoading }) => {
  const [loading, setLoading] = useState(false);
  const isSubmitting = loading || !!externalLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const username = (form.querySelector('#username') as HTMLInputElement).value.trim();
    const password = (form.querySelector('#password') as HTMLInputElement).value;
    setLoading(true);
    try {
      await onLogin(username, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-xl border-slate-200">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <MapPin className="w-6 h-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">POI Admin Portal</CardTitle>
            <CardDescription>
              Đăng nhập để quản lý hệ thống POIs và quán ăn
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tài khoản</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="username" 
                    placeholder="admin" 
                    className="pl-10" 
                    required 
                    defaultValue="admin"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <button type="button" className="text-xs text-primary hover:underline">Quên mật khẩu?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10" 
                    required 
                    defaultValue="password"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <p className="mt-8 text-center text-sm text-slate-500">
          &copy; 2026 POI Management System. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};
