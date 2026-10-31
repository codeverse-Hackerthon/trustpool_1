import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { ShieldCheck, Mail, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('alex.rivera@university.edu');
  const [password, setPassword] = useState('••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password, role: selectedRole });

    if (selectedRole === 'student') navigate('/student/dashboard');
    else if (selectedRole === 'owner') navigate('/owner/dashboard');
    else navigate('/admin/dashboard');
  };

  const handleQuickRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'student') setEmail('alex.rivera@university.edu');
    else if (role === 'owner') setEmail('sarah.chen@university.edu');
    else setEmail('admin@trustpool.edu');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm mb-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome to TrustPool
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to access your shared resources and dashboard
          </p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Select your persona below for instant evaluation access
            </CardDescription>

            {/* Quick Role Switcher Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {(['student', 'owner', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleQuickRoleSelect(r)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize border transition-all ${
                    selectedRole === r
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Institutional Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  SSO & Token Auth Ready
                </span>
                <span className="text-slate-400 cursor-not-allowed">
                  Forgot password?
                </span>
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In as {selectedRole.toUpperCase()}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500">
          Don't have an institutional account?{' '}
          <Link
            to="/register"
            className="font-semibold text-slate-900 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

