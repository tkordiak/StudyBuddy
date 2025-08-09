import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User, LogOut, CreditCard, History } from "lucide-react";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const isActive = (path: string) => location === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/dashboard">
                <h1 className="text-2xl font-bold text-primary cursor-pointer">
                  TailoredApply
                </h1>
              </Link>
            </div>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link href="/dashboard">
                <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/dashboard') 
                    ? 'text-primary bg-blue-50' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                  Dashboard
                </a>
              </Link>
              <Link href="/history">
                <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/history') 
                    ? 'text-primary bg-blue-50' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                  History
                </a>
              </Link>
              <Link href="/billing">
                <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/billing') 
                    ? 'text-primary bg-blue-50' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                  Billing
                </a>
              </Link>
            </nav>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                <span className="mr-1">💳</span>
                {user.credits} credits
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {getInitials(user.email)}
                    </div>
                    <span className="text-sm text-gray-700 hidden sm:block">
                      {user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/billing">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Billing & Credits
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/history">
                      <History className="h-4 w-4 mr-2" />
                      History
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
