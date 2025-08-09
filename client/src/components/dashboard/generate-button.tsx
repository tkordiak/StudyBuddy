import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Shield, CreditCard } from "lucide-react";

interface GenerateButtonProps {
  onGenerate: () => void;
  isLoading: boolean;
  canGenerate: boolean;
  userCredits: number;
}

export function GenerateButton({ 
  onGenerate, 
  isLoading, 
  canGenerate, 
  userCredits 
}: GenerateButtonProps) {
  const hasCredits = userCredits >= 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ready to Generate</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              This will use 1 credit from your account
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Cost</div>
            <Badge variant="outline" className="text-lg font-semibold">
              1 Credit
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!hasCredits && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-orange-600 mr-2" />
                <div>
                  <h4 className="font-medium text-orange-800">Insufficient Credits</h4>
                  <p className="text-sm text-orange-700">
                    You need at least 1 credit to generate. 
                    <a href="/billing" className="underline ml-1">Purchase credits</a>
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={onGenerate}
            disabled={!canGenerate || !hasCredits || isLoading}
            className="w-full py-3 text-lg"
            size="lg"
          >
            {isLoading ? (
              <>
                <Bot className="h-5 w-5 mr-2 animate-pulse" />
                Generating...
              </>
            ) : (
              <>
                <Bot className="h-5 w-5 mr-2" />
                Generate Tailored Resume & Cover Letter
              </>
            )}
          </Button>

          <div className="flex items-center justify-center text-xs text-gray-500">
            <Shield className="h-4 w-4 mr-1" />
            Your data is processed securely and not stored permanently
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
