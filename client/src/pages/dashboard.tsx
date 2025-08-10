import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { ProgressSteps } from "@/components/dashboard/progress-steps";
import { CompanyRoleForm } from "@/components/dashboard/company-role-form";
import { ResumeInput } from "@/components/dashboard/resume-input";
import { GenerateButton } from "@/components/dashboard/generate-button";
import { ResultTabs } from "@/components/dashboard/result-tabs";
import { ExportBar } from "@/components/dashboard/export-bar";
import { LoadingOverlay } from "@/components/dashboard/loading-overlay";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileText } from "lucide-react";

export interface GenerationState {
  company: string;
  role: string;
  jobUrl?: string;
  resumeText: string;
  tailoredResumeMd?: string;
  coverLetterMd?: string;
  generationId?: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generation, setGeneration] = useState<GenerationState>({
    company: "",
    role: "",
    jobUrl: "",
    resumeText: "",
  });

  const handleCompanyRoleSubmit = (data: { company: string; role: string; jobUrl?: string }) => {
    setGeneration(prev => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleResumeSubmit = (resumeText: string) => {
    setGeneration(prev => ({ ...prev, resumeText }));
    setCurrentStep(3);
  };

  const handleGenerate = async () => {
    if (!user) return;
    
    if ((user.credits ?? 0) < 1) {
      toast({
        title: "Insufficient credits",
        description: "You need at least 1 credit to generate materials. Please purchase more credits.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 15, 90));
      }, 500);

      const response = await apiRequest("POST", "/api/generate", {
        company: generation.company,
        role: generation.role,
        jobUrl: generation.jobUrl,
        resumeText: generation.resumeText,
      });

      const result = await response.json();
      
      clearInterval(progressInterval);
      setGenerationProgress(100);

      setGeneration(prev => ({
        ...prev,
        tailoredResumeMd: result.tailoredResumeMd,
        coverLetterMd: result.coverLetterMd,
        generationId: result.id,
      }));

      // Refresh user data to update credits
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });

      toast({
        title: "Generation complete",
        description: "Your tailored resume and cover letter are ready!",
      });

    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleStartNew = () => {
    setGeneration({
      company: "",
      role: "",
      jobUrl: "",
      resumeText: "",
    });
    setCurrentStep(1);
  };

  const hasResults = generation.tailoredResumeMd && generation.coverLetterMd;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressSteps currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Input Forms */}
          <div className="space-y-6">
            <CompanyRoleForm
              onSubmit={handleCompanyRoleSubmit}
              initialData={generation}
              isCompleted={currentStep > 1}
              isEditable={!isGenerating}
            />

            {currentStep >= 2 && (
              <ResumeInput
                onSubmit={handleResumeSubmit}
                initialValue={generation.resumeText}
                isCompleted={currentStep > 2}
                isEditable={!isGenerating}
              />
            )}

            {currentStep >= 3 && (
              <GenerateButton
                onGenerate={handleGenerate}
                isLoading={isGenerating}
                canGenerate={!!generation.company && !!generation.role && !!generation.resumeText}
                userCredits={user?.credits || 0}
              />
            )}
          </div>

          {/* Right Column: Results & Preview */}
          <div className="space-y-6">
            {hasResults ? (
              <>
                <ResultTabs
                  tailoredResumeMd={generation.tailoredResumeMd!}
                  coverLetterMd={generation.coverLetterMd!}
                />
                <ExportBar
                  tailoredResumeMd={generation.tailoredResumeMd!}
                  coverLetterMd={generation.coverLetterMd!}
                  company={generation.company}
                  role={generation.role}
                />
                
                {/* Generation Stats */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium text-gray-900">Generation Complete</div>
                      <div className="text-gray-500 text-xs">Created just now</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-primary">1 Credit Used</div>
                      <div className="text-gray-500 text-xs">~2,850 AI tokens</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <FileText className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
                <p className="text-gray-500 text-sm">
                  Complete the steps on the left to generate your tailored resume and cover letter
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Bar */}
        {hasResults && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-4 text-sm">
                <Button 
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  <i className="fas fa-redo mr-2"></i>
                  Regenerate with Changes
                </Button>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline"
                  onClick={handleStartNew}
                >
                  Start New Generation
                </Button>
                <Button 
                  onClick={() => window.location.href = '/history'}
                >
                  View All History
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <LoadingOverlay
        isVisible={isGenerating}
        progress={generationProgress}
      />
    </div>
  );
}
