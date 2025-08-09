import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, ExternalLink, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { Generation } from "@shared/schema";

export default function History() {
  const { data: generations, isLoading } = useQuery<Generation[]>({
    queryKey: ["/api/history"],
  });

  const handleViewGeneration = (id: string) => {
    window.location.href = `/dashboard?generation=${id}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Generation History</h1>
            <p className="text-gray-600 mt-2">
              View and manage your previous resume and cover letter generations
            </p>
          </div>
          <Button onClick={() => window.location.href = '/dashboard'}>
            New Generation
          </Button>
        </div>

        {!generations || generations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No generations yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first tailored resume and cover letter to see them here
              </p>
              <Button onClick={() => window.location.href = '/dashboard'}>
                Start First Generation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {generations.map((generation) => (
              <Card key={generation.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {generation.role} at {generation.company}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(generation.createdAt!), 'MMM d, yyyy h:mm a')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {generation.tokensUsed} tokens
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewGeneration(generation.id)}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Resume Summary</h4>
                      <p className="text-gray-600 line-clamp-3">
                        {generation.tailoredResumeMd.substring(0, 150)}...
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Cover Letter Preview</h4>
                      <p className="text-gray-600 line-clamp-3">
                        {generation.coverLetterMd.substring(0, 150)}...
                      </p>
                    </div>
                  </div>
                  
                  {generation.jobUrl && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center text-sm text-gray-500">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        <span className="truncate">Job URL: {generation.jobUrl}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
