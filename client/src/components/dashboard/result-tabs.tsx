import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Mail } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ResultTabsProps {
  tailoredResumeMd: string;
  coverLetterMd: string;
}

export function ResultTabs({ tailoredResumeMd, coverLetterMd }: ResultTabsProps) {
  return (
    <Card className="overflow-hidden">
      <Tabs defaultValue="resume" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resume" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Tailored Resume
          </TabsTrigger>
          <TabsTrigger value="cover-letter" className="flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            Cover Letter
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="m-0">
          <CardContent className="p-6 max-h-96 overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold text-gray-900 mb-1 text-center">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 uppercase tracking-wide">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xs font-semibold text-gray-900 mb-1">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-xs text-gray-700 leading-relaxed mb-2">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="text-xs text-gray-700 space-y-1 ml-4 mb-3">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="list-disc">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                }}
              >
                {tailoredResumeMd}
              </ReactMarkdown>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="cover-letter" className="m-0">
          <CardContent className="p-6 max-h-96 overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-lg font-bold text-gray-900 mb-4">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-semibold text-gray-900 mb-3">
                      {children}
                    </h2>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                }}
              >
                {coverLetterMd}
              </ReactMarkdown>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
