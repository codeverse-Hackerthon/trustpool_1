import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { ShieldCheck, User, Mail, Lock, Building2, ArrowRight, Eye, EyeOff, GraduationCap } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      return setError('Please accept the institutional sharing agreement and terms.');
    }
    if (password.length < 12 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      return setError('Password must be at least 12 characters and include upper-case, lower-case, and numeric characters.');
    }
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setError('');

    try {
      await register({
        name,
        email,
        password,
        role: 'student', // Public registration defaults to Student / Borrower per security specifications
        department,
      });

      navigate('/student/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your institutional email.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#14213D] text-white shadow-sm mb-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create TrustPool Account
          </h1>
          <p className="text-xs text-slate-500">
            Join the verified campus sharing network
          </p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle>Student Registration</CardTitle>
            <CardDescription>
              Accounts undergo identity and institutional verification
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Miller"
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Campus Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-700">Account Type</label>
                  <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>Student / Borrower</span>
                  </div>
                </div>

                <Input
                  label="Department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Engineering"
                  leftIcon={<Building2 className="w-4 h-4" />}
                  required
                />
              </div>

              <Input
                label="Password (min 12 characters)"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create secure password"
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="-mt-2 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPassword ? 'Hide password' : 'Show password'}
              </button>

              {/* Terms and conditions acceptance */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  required
                />
                <label htmlFor="terms" className="text-xs text-slate-600 leading-normal">
                  I agree to the <span className="font-medium text-slate-900">Campus Resource Sharing Terms</span>, prompt return accountability, and institutional verification checks.
                </label>
              </div>

              {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}

              <p className="text-[11px] leading-relaxed text-slate-500">
                Note: Resource Owner and Administrator privileges are designated by departmental invitation.
              </p>

              <Button
                type="submit"
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Register & Initialize Trust Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-semibold text-slate-900 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
