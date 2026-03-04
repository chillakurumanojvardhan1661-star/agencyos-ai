'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Sparkles, FileText, CreditCard, FileCode, BarChart3, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/FirebaseAuthProvider';
import { auth as firebaseAuth } from '@/lib/firebase/config';
import { signOut as firebaseSignOut } from 'firebase/auth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Generate Content', href: '/dashboard/generate', icon: Sparkles },
  { name: 'Templates', href: '/dashboard/templates', icon: FileCode },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
];

const adminNavigation = [
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export function Sidebar() {
  const { user: firebaseUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    checkAdminStatus();
    if (firebaseUser) {
      setUserEmail(firebaseUser.email || '');
    } else {
      getUserEmail();
    }
  }, [firebaseUser]);

  const getUserEmail = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
      }
    } catch (error) {
      console.error('Failed to get user email:', error);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('is_admin');

      if (!error && data) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Failed to check admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (firebaseUser) {
        await firebaseSignOut(firebaseAuth);
      }
      const supabase = createClient();
      await supabase.auth.signOut();

      // Clear cookie manually just in case
      document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-secondary/50">
      <div className="p-6">
        <h1 className="text-2xl font-bold">AgencyOS AI</h1>
        {userEmail && (
          <p className="text-xs text-muted-foreground mt-1 truncate">{userEmail}</p>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}

        {/* Admin Section */}
        {!loading && isAdmin && (
          <>
            <div className="my-4 border-t border-border"></div>
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Admin
            </div>
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
