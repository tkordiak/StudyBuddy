import { Header } from "@/components/layout/header";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, Star, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Billing() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePurchaseCredits = async (amount: number, credits: number) => {
    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount,
        credits,
      });
      
      const { clientSecret } = await response.json();
      
      // Redirect to Stripe Checkout or handle payment
      toast({
        title: "Payment processing",
        description: "Redirecting to secure payment...",
      });
      
      // In a real implementation, you'd integrate with Stripe Elements here
      
    } catch (error) {
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Credits</h1>
          <p className="text-gray-600 mt-2">
            Manage your subscription and purchase additional credits
          </p>
        </div>

        {/* Current Plan */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary mb-2">
                {user?.plan === 'pro' ? 'Pro Monthly' : 'Free Plan'}
              </div>
              <p className="text-gray-600 text-sm">
                {user?.plan === 'pro' 
                  ? '100 generations per month' 
                  : 'Pay-as-you-go credits'
                }
              </p>
              {user?.plan === 'pro' && (
                <Badge className="mt-2">Active Subscription</Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Available Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 mb-2">
                {user?.credits || 0}
              </div>
              <p className="text-gray-600 text-sm">
                Each generation uses 1 credit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Usage This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                0
              </div>
              <p className="text-gray-600 text-sm">
                Generations completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Purchase Credits</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Credits Pack */}
            <Card className="relative">
              <CardHeader>
                <CardTitle>Credits Pack</CardTitle>
                <div className="text-3xl font-bold">$9</div>
                <CardDescription>20 additional generations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    20 generations
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    All export formats
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Never expires
                  </li>
                </ul>
                <Button 
                  className="w-full"
                  onClick={() => handlePurchaseCredits(9, 20)}
                >
                  Purchase Credits
                </Button>
              </CardContent>
            </Card>

            {/* Pro Monthly */}
            <Card className="border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500">Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle>Pro Monthly</CardTitle>
                <div className="text-3xl font-bold">$12</div>
                <CardDescription>100 generations per month</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    100 generations/month
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Priority queue
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Premium support
                  </li>
                </ul>
                <Button 
                  className="w-full"
                  disabled={user?.plan === 'pro'}
                >
                  {user?.plan === 'pro' ? 'Current Plan' : 'Subscribe'}
                </Button>
              </CardContent>
            </Card>

            {/* Large Credits Pack */}
            <Card>
              <CardHeader>
                <CardTitle>Large Pack</CardTitle>
                <div className="text-3xl font-bold">$19</div>
                <CardDescription>50 additional generations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    50 generations
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Best value per credit
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Priority support
                  </li>
                </ul>
                <Button 
                  className="w-full"
                  onClick={() => handlePurchaseCredits(19, 50)}
                >
                  Purchase Credits
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>Your recent transactions and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No billing history yet</p>
              <p className="text-sm">Your transactions will appear here</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
