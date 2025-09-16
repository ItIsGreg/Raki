"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Download, Shield, Bot, Sparkles, Database, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import WelcomeTab from "@/components/tutorial/tabs/WelcomeTab";
import TextUploadTab from "@/components/tutorial/tabs/TextUploadTab";
import AISetupTab from "@/components/tutorial/tabs/AISetupTab";
import ProfilesTab from "@/components/tutorial/tabs/ProfilesTab";
import AnnotationTab from "@/components/tutorial/tabs/AnnotationTab";
import TipsTab from "@/components/tutorial/tabs/TipsTab";

export default function TutorialPage() {
  return (
    <div className="min-h-full bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Tutorial</h1>
          
          <Tabs defaultValue="welcome" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="welcome">Welcome</TabsTrigger>
              <TabsTrigger value="text-upload">Text Upload</TabsTrigger>
              <TabsTrigger value="ai-setup">AI Setup</TabsTrigger>
              <TabsTrigger value="profiles">Profiles</TabsTrigger>
              <TabsTrigger value="annotation">Annotation</TabsTrigger>
              <TabsTrigger value="tips">Tips & Tricks</TabsTrigger>
            </TabsList>

            <TabsContent value="welcome">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Welcome to Raki
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WelcomeTab />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="text-upload">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Text Upload
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TextUploadTab />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-setup">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    AI Setup
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AISetupTab />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profiles">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Profiles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfilesTab />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="annotation">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scissors className="w-5 h-5" />
                    Annotation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnnotationTab />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Tips & Tricks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TipsTab />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
