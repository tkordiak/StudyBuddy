import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, FileText, Download, Share, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ExportBarProps {
  tailoredResumeMd: string;
  coverLetterMd: string;
  company: string;
  role: string;
}

export function ExportBar({ 
  tailoredResumeMd, 
  coverLetterMd, 
  company, 
  role 
}: ExportBarProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleCopyText = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: `${type} copied as plain text`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (content: string, format: 'docx' | 'pdf', type: string) => {
    const exportKey = `${format}-${type}`;
    setIsExporting(exportKey);
    
    try {
      const title = `${type} - ${role} at ${company}`;
      const response = await apiRequest("POST", `/api/export/${format}`, {
        content,
        title,
      });

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: `${type} downloaded as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsExporting(null);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Resume & Cover Letter - ${role} at ${company}`,
          text: `Check out my tailored resume and cover letter for ${role} at ${company}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or share failed
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Page URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Export Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Resume Export */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Resume</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyText(tailoredResumeMd, "Resume")}
                className="flex flex-col items-center justify-center py-3 px-2 h-auto text-xs"
              >
                <Copy className="h-4 w-4 mb-1" />
                Copy Text
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(tailoredResumeMd, 'docx', 'Resume')}
                disabled={isExporting === 'docx-Resume'}
                className="flex flex-col items-center justify-center py-3 px-2 h-auto text-xs"
              >
                {isExporting === 'docx-Resume' ? (
                  <Loader2 className="h-4 w-4 mb-1 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mb-1 text-blue-500" />
                )}
                DOCX
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(tailoredResumeMd, 'pdf', 'Resume')}
                disabled={isExporting === 'pdf-Resume'}
                className="flex flex-col items-center justify-center py-3 px-2 h-auto text-xs"
              >
                {isExporting === 'pdf-Resume' ? (
                  <Loader2 className="h-4 w-4 mb-1 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mb-1 text-red-500" />
                )}
                PDF
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex flex-col items-center justify-center py-3 px-2 h-auto text-xs"
              >
                <Share className="h-4 w-4 mb-1 text-green-500" />
                Share
              </Button>
            </div>
          </div>

          {/* Cover Letter Export */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Cover Letter</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyText(coverLetterMd, "Cover Letter")}
                className="flex flex-col items-center justify-center py-3 px-2 h-auto text-xs"
              >
                <Copy className="h-4 w-4 mb-1" />
                Copy Text
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(coverLetterMd, 'docx', 'Cover Letter')}
                disabled={isExporting === 'docx-Cover Letter'}
                className="flex flex-col items-center justify-center py-3 px-2 h-auto text-xs"
              >
                {isExporting === 'docx-Cover Letter' ? (
                  <Loader2 className="h-4 w-4 mb-1 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mb-1 text-blue-500" />
                )}
                DOCX
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(coverLetterMd, 'pdf', 'Cover Letter')}
                disabled={isExporting === 'pdf-Cover Letter'}
                className="flex flex-col items-center justify-center py-3 px-2 h-auto text-xs"
              >
                {isExporting === 'pdf-Cover Letter' ? (
                  <Loader2 className="h-4 w-4 mb-1 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mb-1 text-red-500" />
                )}
                PDF
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex flex-col items-center justify-center py-3 px-2 h-auto text-xs"
              >
                <Share className="h-4 w-4 mb-1 text-green-500" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
