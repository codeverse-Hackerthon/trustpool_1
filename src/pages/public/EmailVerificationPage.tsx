import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, MailCheck, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const isVerified = Boolean(token && token !== 'invalid');

  const handleResend = () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      setResent(true);
    }, 700);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#14213D] text-white shadow-sm mb-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Email Verification
          </h1>
          <p className="text-xs text-slate-500">
            Institutional email validation for campus security
          </p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle>{isVerified ? 'Verification Confirmed' : 'Confirm Your Email'}</CardTitle>
            <CardDescription>
              {isVerified
                ? 'Your institutional email has been verified successfully'
                : 'Please verify your campus email to unlock resource booking privileges'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isVerified ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-900 text-sm">Account Activated</h3>
                  <p className="text-xs text-slate-500">
                    Your institutional affiliation is confirmed. You can now explore resources, request bookings, and join equipment waitlists.
                  </p>
                </div>
                <Link to="/login" className="block pt-2">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Continue to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
                  <MailCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-900 text-sm">Check your inbox</h3>
                  <p className="text-xs text-slate-500">
                    We sent a verification link to your registered campus email address. Click the link to complete your profile.
                  </p>
                </div>

                {resent && (
                  <p className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    A fresh verification link has been dispatched to your email.
                  </p>
                )}

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleResend}
                    isLoading={resending}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                    className="w-full"
                  >
                    Resend Verification Email
                  </Button>

                  <Link to="/login" className="text-xs text-slate-600 hover:text-slate-900 font-medium pt-2">
                    Back to Sign In
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

