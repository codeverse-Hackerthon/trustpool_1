import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const UnauthorizedPage: React.FC = () => (
  <div className="min-h-screen grid place-items-center bg-slate-50 p-6">
    <div className="max-w-md text-center space-y-5"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600"><ShieldAlert /></div>
      <div><h1 className="text-2xl font-bold">Access restricted</h1><p className="mt-2 text-sm text-slate-500">Your current account does not have permission to view this workspace.</p></div>
      <Link to="/"><Button>Return to trustPool</Button></Link>
    </div>
  </div>
);
