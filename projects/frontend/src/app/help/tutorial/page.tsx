"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Download, Shield, Bot, Sparkles, Database, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";

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

            {/* Welcome Tab */}
            <TabsContent value="welcome">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Welcome to Raki
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">What is Raki?</h3>
                    <p className="text-muted-foreground">
                      Raki is a specialized tool designed to help you extract tabular data
                      from text documents. While it was initially developed for medical
                      research, its flexible design makes it suitable for various data
                      extraction tasks across different domains.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">AI-Powered Annotation</h3>
                    <p className="text-muted-foreground">
                      Raki leverages advanced large language models to assist in the
                      annotation process. The AI can suggest potential data points based
                      on your defined profiles, making the annotation process faster and
                      more efficient while maintaining high accuracy.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Key Features</h3>
                    <ul className="list-disc pl-4 space-y-2 text-muted-foreground">
                      <li>Define custom data points to extract</li>
                      <li>Organize data points into reusable profiles</li>
                      <li>Batch process multiple documents</li>
                      <li>AI-assisted annotation suggestions</li>
                      <li>Export data in structured formats</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Text Upload Tab */}
            <TabsContent value="text-upload">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Text Upload
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p>
                    First of all in the upper right corner of your screen you should see
                    three tabs: <span className="font-medium">Annotation - Profiles - Text Upload</span>
                  </p>
                  <p>Start by going to the text upload tab.</p>

                  <p>
                    Let's start the tutorial by uploading some data that we can
                    annotate. This time we'll use a dataset that contains sensitive
                    medical information to demonstrate our privacy protection features.
                  </p>
                  
                  <Button
                    variant="secondary"
                    className="flex items-center gap-2"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = "/example-echos-with-names-dobs.xlsx";
                      link.download = "example-echos-with-names-dobs.xlsx";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Download Example Data (with sensitive information)
                  </Button>

                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Creating a New Text Set</p>
                      <p>
                        In the Text Upload Tab click on the{" "}
                        <span className="font-semibold">New Text Set</span> Button. This
                        lets you name how the texts that we upload will be stored.
                      </p>
                      <p>
                        You might just want to give a name like{" "}
                        <span className="font-semibold">Echoreports</span>, or{" "}
                        <span className="font-semibold">Test Texts</span>. You can also
                        provide a short description if you like. Click the{" "}
                        <span className="font-semibold">Save</span> button to create the
                        Text Set.
                      </p>
                    </div>

                    <div>
                      <p className="font-medium">Uploading Your Texts</p>
                      <p>
                        Now you can start uploading. Click the{" "}
                        <span className="font-semibold">upload</span> Button. It lets you
                        chose between different options on how to upload the texts. We
                        have our texts in a table, so you can chose the{" "}
                        <span className="font-semibold">upload table</span> option.
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <p className="font-medium text-blue-900">
                          Privacy Protection with Anonymisation
                        </p>
                      </div>
                      <p className="text-blue-800 mb-3">
                        Since our dataset contains sensitive patient information (names
                        and dates of birth), we should use the anonymisation feature to
                        protect patient privacy before importing.
                      </p>
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium text-blue-900">Step 1: Enable Anonymisation</p>
                          <p className="text-blue-800">
                            Before selecting your columns, click the{" "}
                            <span className="font-semibold">Start Anonymisation</span>{" "}
                            button. This will highlight the table headers in yellow,
                            indicating anonymisation mode is active.
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-blue-900">Step 2: Select Sensitive Columns</p>
                          <p className="text-blue-800">
                            Click on the column headers that contain sensitive
                            information like names and dates of birth.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Setup Tab */}
            <TabsContent value="ai-setup">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    AI Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p>
                    Configure your AI settings to get the best results from Raki's
                    intelligent annotation features.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">LLM Provider Selection</h3>
                      <p className="text-muted-foreground">
                        Choose your preferred Large Language Model provider from the settings menu.
                        Raki supports multiple providers for maximum flexibility.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">API Configuration</h3>
                      <p className="text-muted-foreground">
                        Enter your API key and configure the model parameters to optimize
                        performance and accuracy for your specific use case.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Batch Processing</h3>
                      <p className="text-muted-foreground">
                        Adjust batch sizes and processing parameters to balance speed
                        and resource usage based on your system capabilities.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profiles Tab */}
            <TabsContent value="profiles">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Profiles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p>
                    Create and manage data point profiles to define what information
                    you want to extract from your texts.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Creating Profiles</h3>
                      <p className="text-muted-foreground">
                        Define custom data points with specific extraction rules,
                        validation criteria, and output formats.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Profile Management</h3>
                      <p className="text-muted-foreground">
                        Organize your profiles into categories, reuse them across
                        different projects, and share them with your team.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Template Library</h3>
                      <p className="text-muted-foreground">
                        Access pre-built profile templates for common data extraction
                        tasks and customize them for your specific needs.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Annotation Tab */}
            <TabsContent value="annotation">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scissors className="w-5 h-5" />
                    Annotation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p>
                    Learn how to efficiently annotate your texts using Raki's
                    AI-assisted annotation tools.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Manual Annotation</h3>
                      <p className="text-muted-foreground">
                        Manually select and annotate text segments with your defined
                        data points for precise control over the extraction process.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">AI Suggestions</h3>
                      <p className="text-muted-foreground">
                        Let the AI suggest potential annotations based on your profiles,
                        then review and approve or modify the suggestions.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Batch Processing</h3>
                      <p className="text-muted-foreground">
                        Process multiple texts simultaneously with AI assistance,
                        significantly speeding up your annotation workflow.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tips Tab */}
            <TabsContent value="tips">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Tips & Tricks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">💡 Pro Tips</h3>
                      <ul className="list-disc pl-4 space-y-1 text-green-800">
                        <li>Start with a small test dataset to refine your profiles</li>
                        <li>Use descriptive names for your data points</li>
                        <li>Enable anonymisation for sensitive data</li>
                        <li>Review AI suggestions before accepting them</li>
                        <li>Export your data regularly to avoid data loss</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">⚡ Performance Tips</h3>
                      <ul className="list-disc pl-4 space-y-1 text-blue-800">
                        <li>Adjust batch sizes based on your system performance</li>
                        <li>Use appropriate model parameters for your use case</li>
                        <li>Process similar documents together for better accuracy</li>
                        <li>Regularly update your profiles based on results</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-900 mb-2">🔧 Troubleshooting</h3>
                      <ul className="list-disc pl-4 space-y-1 text-purple-800">
                        <li>Check your API configuration if AI suggestions aren't working</li>
                        <li>Verify file formats are supported</li>
                        <li>Ensure your profiles are properly configured</li>
                        <li>Contact support if you encounter persistent issues</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
