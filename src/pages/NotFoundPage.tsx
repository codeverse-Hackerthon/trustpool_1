import React from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <EmptyState
          icon={<AlertCircle className="w-8 h-8 text-slate-400" />}
          title="Page Not Found"
          description="The TrustPool resource or route you requested does not exist or may have been relocated."
        />
        <div className="flex justify-center gap-3">
          <Link to="/">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Return Home
            </Button>
          </Link>
          <Link to="/student/dashboard">
            <Button size="sm">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

