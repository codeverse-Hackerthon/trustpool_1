import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  User,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Check,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, role } = useAuth();

  const [name, setName] = useState(user?.name || 'Alex Rivera');
  const [email] = useState(user?.email || 'alex.rivera@university.edu');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 234-5678');
  const [department, setDepartment] = useState(user?.department || 'Computer Science');
  const [saved, setSaved] = useState(false);

  // Security section
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [waitlistAlerts, setWaitlistAlerts] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Account & Profile Settings"
        description="Manage your institutional credentials, security settings, and communication preferences"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Trust Profile Card */}
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardContent className="p-6 text-center space-y-4">
              <div className="relative inline-block mx-auto">
                <div className="w-20 h-20 rounded-full bg-[#14213D] text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow-md mx-auto">
                  {name.charAt(0)}
                </div>
                <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-500 text-white shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-lg">{name}</h3>
                <p className="text-xs text-slate-500 capitalize">{role} Member • {department}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Trust Score</span>
                  <span className="text-xs font-bold text-emerald-600">{user?.trustScore || 95} / 100</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${user?.trustScore || 95}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Calculated from timely returns, verified condition reports, and peer ratings.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Institutional ID:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {user?.institutionId || 'INST-88291'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Verification:</span>
                  <StatusBadge status="APPROVED" label="Verified Active" size="sm" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Member Since:</span>
                  <span className="text-slate-700">Fall 2025</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3">
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-slate-700">Booking status changes</span>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-slate-700">Return window reminders</span>
                <input
                  type="checkbox"
                  checked={bookingReminders}
                  onChange={(e) => setBookingReminders(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-slate-700">Waitlist promotion alerts</span>
                <input
                  type="checkbox"
                  checked={waitlistAlerts}
                  onChange={(e) => setWaitlistAlerts(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </CardContent>
          </Card>
        </div>

        {/* Right Columns: Edit Profile & Security Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your primary contact and institutional profile details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    leftIcon={<User className="w-4 h-4" />}
                    required
                  />

                  <Input
                    label="Institutional Email"
                    value={email}
                    leftIcon={<Mail className="w-4 h-4" />}
                    disabled
                    helperText="Email changes require institutional re-authentication"
                  />

                  <Input
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    leftIcon={<Phone className="w-4 h-4" />}
                    placeholder="+1 (555) 000-0000"
                  />

                  <Input
                    label="Department / Faculty"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    leftIcon={<Building2 className="w-4 h-4" />}
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  {saved ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" /> Profile changes saved successfully
                    </span>
                  ) : <span />}

                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                    leftIcon={<Check className="w-4 h-4" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password & Security Card */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>
                Manage your login credentials and active session tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4" />}
                    placeholder="Enter current password"
                    required
                  />

                  <Input
                    label="New Password (min 12 chars)"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4" />}
                    placeholder="Enter new secure password"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  {passwordSaved ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" /> Password updated
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      Password must contain upper, lower, and numeric characters.
                    </span>
                  )}

                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Active Sessions & Security Assurance */}
          <Card className="border-slate-200 bg-slate-50/50">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900">Cryptographic JWT Security</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your session is protected with auto-refreshing JWT access tokens. If you suspect unauthorized access, changing your password immediately invalidates all active refresh tokens.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
