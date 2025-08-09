import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, CheckCircle, Zap, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const { user, requestMagicLinkMutation, verifyMagicLinkMutation } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Redirect authenticated users to dashboard
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  // Check for magic link token in URL
  useEffect(() => {
    // Check for token in hash parameters (after #)
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.split('?')[1] || '');
    const tokenFromHash = hashParams.get('token');
    
    // Check for token in regular URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    // Check for error in hash parameters
    const error = hashParams.get('error');
    if (error) {
      let errorMessage = 'Authentication failed';
      switch(error) {
        case 'token-used':
          errorMessage = 'This magic link has already been used';
          break;
        case 'token-expired':
          errorMessage = 'This magic link has expired';
          break;
        case 'invalid-token':
          errorMessage = 'Invalid magic link';
          break;
      }
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
      // Clear the error from URL
      window.history.replaceState({}, '', '#/auth');
    }
    
    const token = tokenFromHash || tokenFromUrl;
    if (token) {
      verifyMagicLinkMutation.mutate({ token }, {
        onSuccess: () => {
          // Clear the token from URL after successful verification
          window.history.replaceState({}, '', '#/auth');
        }
      });
    }
  }, [verifyMagicLinkMutation, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    requestMagicLinkMutation.mutate({ email }, {
      onSuccess: () => {
        setEmailSent(true);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Column - Auth Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">TailoredApply</h1>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email to receive a magic link
            </p>
          </div>

          {!emailSent ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Sign In</CardTitle>
                <CardDescription className="text-center">
                  We'll send you a secure link to sign in instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={requestMagicLinkMutation.isPending}
                  >
                    {requestMagicLinkMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending Magic Link...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Magic Link
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-4 text-xs text-gray-500 text-center">
                  No account? One will be created automatically when you first sign in.
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Check your email
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We've sent a magic link to <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Click the link in the email to sign in. The link will expire in 15 minutes.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEmailSent(false);
                      setEmail("");
                    }}
                    className="text-sm"
                  >
                    Use different email
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {verifyMagicLinkMutation.isPending && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-sm text-gray-600">Verifying your magic link...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Right Column - Hero Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="flex flex-col justify-center px-12">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold mb-6">
              Land Your Dream Job with AI-Powered Applications
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Generate tailored resumes and cover letters for specific companies in minutes, not hours.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4" />
                </div>
                <span>AI-powered content generation</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <span>ATS-friendly formatting</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span>Company-specific tailoring</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white bg-opacity-10 rounded-lg">
              <p className="text-sm opacity-75">
                "TailoredApply helped me get 3x more interviews by creating company-specific applications that actually stand out."
              </p>
              <p className="text-xs mt-2 font-medium">- Sarah K., Software Engineer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
