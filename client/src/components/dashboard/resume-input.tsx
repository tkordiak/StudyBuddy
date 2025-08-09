import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Upload, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ResumeInputProps {
  onSubmit: (resumeText: string) => void;
  initialValue: string;
  isCompleted: boolean;
  isEditable: boolean;
}

export function ResumeInput({ 
  onSubmit, 
  initialValue, 
  isCompleted, 
  isEditable 
}: ResumeInputProps) {
  const [resumeText, setResumeText] = useState(initialValue);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("paste");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      setResumeText(result.text);
      
      toast({
        title: "File uploaded successfully",
        description: `Extracted ${result.wordCount} words from ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = () => {
    if (resumeText.trim().length < 100) {
      toast({
        title: "Resume too short",
        description: "Please provide at least 100 characters of resume content",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit(resumeText);
  };

  const wordCount = resumeText.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = resumeText.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Resume</CardTitle>
          {isCompleted && (
            <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="paste">Paste Text</TabsTrigger>
            <TabsTrigger value="upload">Upload File</TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="space-y-4">
            <div>
              <Label htmlFor="resumeText">Resume Content</Label>
              <Textarea
                id="resumeText"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                rows={12}
                className="mt-2"
                disabled={!isEditable && isCompleted}
              />
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              
              {isUploading ? (
                <div className="space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-gray-600">Processing your file...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">
                    Upload a PDF or Word document
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                  <p className="text-xs text-gray-500">
                    Supports PDF, DOC, and DOCX files up to 10MB
                  </p>
                </div>
              )}
            </div>
            
            {resumeText && (
              <div>
                <Label htmlFor="extractedText">Extracted Text</Label>
                <Textarea
                  id="extractedText"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={8}
                  className="mt-2"
                  disabled={!isEditable && isCompleted}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-gray-500">
            <FileText className="h-4 w-4 inline mr-1" />
            {wordCount} words • {charCount} characters
          </div>
          
          {resumeText && !isCompleted && (
            <Button onClick={handleSubmit} disabled={!isEditable}>
              Continue to Generate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
