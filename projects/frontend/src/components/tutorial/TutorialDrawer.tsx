import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HelpCircle, X, Download, Bot, Settings, Sparkles } from "lucide-react";
import { getUserSettings, updateUserSettings } from "@/lib/db/crud";
import { useLiveQuery } from "dexie-react-hooks";

interface TutorialDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const TutorialDrawer = ({ isOpen, onOpenChange }: TutorialDrawerProps) => {
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  // Get user settings from database
  const userSettings = useLiveQuery(() => getUserSettings(), []);

  // Update tutorial completed state when user settings change
  useEffect(() => {
    if (userSettings) {
      setTutorialCompleted(userSettings.tutorialCompleted);
    }
  }, [userSettings]);

  // Handle tutorial completion
  const handleTutorialComplete = async (completed: boolean) => {
    setTutorialCompleted(completed);
    await updateUserSettings({ tutorialCompleted: completed });
    if (completed) {
      onOpenChange(false);
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
      <Drawer
        open={isOpen}
        onOpenChange={onOpenChange}
        modal={false}
        shouldScaleBackground={false}
      >
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-[50vh]">
          <Tabs defaultValue="welcome" className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between px-4 border-b">
              <TabsList className="justify-start">
                <TabsTrigger value="welcome">Welcome</TabsTrigger>
                <TabsTrigger value="text-upload">Text Upload</TabsTrigger>
                <TabsTrigger value="ai-setup">AI Setup</TabsTrigger>
                <TabsTrigger value="profiles">Profiles</TabsTrigger>
                <TabsTrigger value="annotation">Annotation</TabsTrigger>
                <TabsTrigger value="tips">Tips & Tricks</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Label htmlFor="tutorial-settings">Tutorial Done</Label>
                <Checkbox
                  id="tutorial-settings"
                  checked={tutorialCompleted}
                  onCheckedChange={(checked) =>
                    handleTutorialComplete(checked as boolean)
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="welcome" className="p-4 h-full">
                <DrawerHeader className="px-0">
                  <DrawerTitle>Welcome to Raki</DrawerTitle>
                  <DrawerDescription>
                    Extract structured data from your texts with ease
                  </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-6 pb-4">
                  <div>
                    <h3 className="font-semibold mb-2">What is Raki?</h3>
                    <p className="text-muted-foreground">
                      Raki is a specialized tool designed to help you extract
                      tabular data from text documents. While it was initially
                      developed for medical research, its flexible design makes
                      it suitable for various data extraction tasks across
                      different domains.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      AI-Powered Annotation
                    </h3>
                    <p className="text-muted-foreground">
                      Raki leverages advanced large language models to assist in
                      the annotation process. The AI can suggest potential data
                      points based on your defined profiles, making the
                      annotation process faster and more efficient while
                      maintaining high accuracy.
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
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      You can always access this tutorial by clicking the
                      question mark icon at the bottom of the page.
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="profiles" className="p-4">
                <DrawerHeader>
                  <DrawerTitle>Working with Profiles</DrawerTitle>
                  <DrawerDescription>
                    Learn how to create and manage profiles for data extraction
                  </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 mt-1 text-primary" />
                      <div>
                        <p className="font-medium mb-2">
                          Let's Start the Real Deal!
                        </p>
                        <p>
                          We want to extract data from our texts. We uploaded
                          some echocardiography reports, which are reports from
                          ultrasound examinations of the heart. If you are a
                          medical professional this will probably tell you
                          something. If not, it is not too bad! We will work
                          through it 😊
                        </p>
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-md">
                      <p className="font-medium mb-2">
                        Understanding Echocardiography Reports
                      </p>
                      <p>
                        The echocardiography report contains a number of
                        measurements, for example:
                      </p>
                      <ul className="list-disc pl-4 mt-2 space-y-1">
                        <li>
                          How good the heart is pumping (the ejection fraction)
                        </li>
                        <li>
                          If all the heart valves are okay or if some are leaky
                        </li>
                      </ul>
                      <p className="mt-2">
                        We can tell the Large Language Model to look for these
                        measurements in the text.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p>
                        We do this by creating a profile. And then in the
                        profile we will create some datapoints.
                      </p>

                      <div className="space-y-2">
                        <p className="font-medium">
                          Creating Your First Profile
                        </p>
                        <p>
                          Next to the{" "}
                          <span className="font-semibold">Text Upload</span> Tab
                          is the <span className="font-semibold">Profiles</span>{" "}
                          Tab in the upper right corner. This is where we want
                          to go to now.
                        </p>
                        <p>
                          You will find there a{" "}
                          <span className="font-semibold">Plus</span> button,
                          that lets you create a new profile. Go ahead and click
                          it.
                        </p>
                        <p>
                          You need to provide a name and a description if you
                          like. You can just call the profile{" "}
                          <span className="font-semibold">
                            Tutorial-Echocardiography
                          </span>{" "}
                          for example. Click{" "}
                          <span className="font-semibold">Save</span>. Great!
                        </p>
                      </div>

                      <div className="bg-muted p-4 rounded-md">
                        <p className="font-medium mb-2">
                          🤖 Time to Use Our LLM!
                        </p>
                        <p>
                          Now let's continue by creating the profile points that
                          we want to extract from the texts. And this is the
                          first time that our Large Language Model comes into
                          play.
                        </p>
                        <p className="mt-2">
                          In the{" "}
                          <span className="font-semibold">Data Points</span> Tab
                          you will see a{" "}
                          <span className="font-semibold">Plus</span> Button and
                          a <span className="font-semibold">Chat</span> Button.
                          Go ahead and click the Chat button and we can let the
                          LLM create Profile Points for us.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <p>
                          You can just chat normally, like you do with ChatGPT.
                          The specialty is that the model got primed to create
                          profile points for us if we ask it to.
                        </p>

                        <div className="bg-muted p-4 rounded-md">
                          <p className="font-medium mb-2">Try This Command</p>
                          <p>
                            Create profile points for Echocardiography. Create
                            the profile points LVEF, Pericardial Effusion,
                            Mitral Insufficiency, Tricuspid Insufficiency,
                            Aortic Stenosis
                          </p>
                        </div>

                        <p>
                          See what happens. The LLM is now creating profile
                          points for us. The output may look a bit chunky. This
                          is because in the background we told the model how the
                          output needs to look like, so that we can continue
                          using it in our app.
                        </p>
                        <p>
                          After the LLM finished generating you can just click
                          on <span className="font-semibold">adopt all</span>{" "}
                          and Boom! The profile points are in our list! 🎉
                        </p>
                      </div>

                      <div className="space-y-4 mt-6">
                        <div>
                          <p className="font-medium mb-2">
                            Understanding Profile Points
                          </p>
                          <p>
                            Alright, lets take a look at the profile points that
                            were created. You can click through them. Take a
                            look at the editor. You can see what the llm
                            created. For each Datapoint a name is provided.
                            Furthermore there is an explanation, synonyms, the
                            datatype can be defined, and even the unit of the
                            datapoint, if it has one.
                          </p>
                        </div>

                        <div>
                          <p>
                            All these information we provide so that the LLM
                            knows what to look for in the texts it will analyse.
                            Especially the explanation and synonyms are
                            important.
                          </p>
                          <p className="mt-2">
                            By carefully adding synonyms and providing
                            information in the explanation you suppor the LLM in
                            extracting datapoints from the texts!
                          </p>
                        </div>

                        <div>
                          <p>
                            If you are an expert in echocardiography feel free
                            to modify the synonyms and explanations of the
                            datapoints. But no stress. The datapoint we have
                            right now should be fully sufficient to see the app
                            in action.
                          </p>
                        </div>

                        <div>
                          <p>
                            Great! Now we have already used the Large Language
                            Model. Furthermore we created Profile Points that we
                            can now use to extract data from our texts. How
                            exciting is that?!
                          </p>
                          <p className="mt-2">
                            Let us continue now by actually using the LLM to
                            extract them datapoints ;)
                          </p>
                        </div>

                        <div className="bg-muted p-4 rounded-md">
                          <p className="text-primary font-medium flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Go to the Tab Annotation in the Tutorial if you are
                            ready to continue.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="annotation" className="p-4">
                <DrawerHeader>
                  <DrawerTitle>Annotation Process</DrawerTitle>
                  <DrawerDescription>
                    Master the art of text annotation with AI assistance
                  </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Bot className="h-5 w-5 mt-1 text-primary" />
                      <div>
                        <p className="font-medium mb-2">
                          Time to Extract Data!
                        </p>
                        <p>
                          Now that we have our profile points set up, we can use
                          the LLM to help us extract data from our texts. This
                          is where the magic happens! 🎩✨
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="font-medium">
                        Getting Started with Annotation
                      </p>
                      <p>
                        First, go to the{" "}
                        <span className="font-semibold">Annotation</span> tab in
                        the main interface. You'll see a list of your uploaded
                        texts on the left side.
                      </p>
                      <p>
                        Select one of the texts to begin the annotation process.
                        The text will be displayed in the main area.
                      </p>
                    </div>

                    <div className="bg-muted p-4 rounded-md">
                      <p className="font-medium mb-2">
                        Using the LLM Assistant
                      </p>
                      <p>
                        In the annotation interface, you'll find a chat button
                        that lets you interact with the LLM. Click it to open
                        the chat interface.
                      </p>
                      <p className="mt-2">
                        You can ask the LLM to analyze the text and find
                        instances of our profile points. For example, you could
                        say:
                      </p>
                      <div className="mt-2 p-3 bg-background rounded-md">
                        <p className="text-sm italic">
                          "Please analyze this text and find any mentions of
                          LVEF, Pericardial Effusion, and valve
                          insufficiencies."
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="font-medium">Understanding the Results</p>
                      <p>
                        The LLM will analyze the text and provide suggestions
                        for data points it finds. For each suggestion, you'll
                        see:
                      </p>
                      <ul className="list-disc pl-4 space-y-2">
                        <li>The extracted value</li>
                        <li>The relevant text span</li>
                        <li>The confidence level of the extraction</li>
                      </ul>
                      <p className="mt-2">
                        You can review each suggestion and either accept it or
                        modify it as needed. The LLM's suggestions are based on
                        the profile points we created, using the explanations
                        and synonyms we provided.
                      </p>
                    </div>

                    <div className="bg-muted p-4 rounded-md">
                      <p className="font-medium mb-2">
                        Tips for Better Results
                      </p>
                      <ul className="list-disc pl-4 space-y-2">
                        <li>Be specific in your requests to the LLM</li>
                        <li>Review the extracted values carefully</li>
                        <li>Use the chat to ask for clarification if needed</li>
                        <li>Don't hesitate to modify the LLM's suggestions</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <p className="font-medium">Saving Your Work</p>
                      <p>
                        As you accept or modify the LLM's suggestions, the
                        annotations are automatically saved. You can always come
                        back to a text later to review or modify the
                        annotations.
                      </p>
                      <p className="mt-2">
                        Once you're satisfied with the annotations for a text,
                        you can move on to the next one. The LLM will help you
                        maintain consistency across all your texts.
                      </p>
                    </div>

                    <div className="bg-muted p-4 rounded-md">
                      <p className="font-medium mb-2">Ready to Try?</p>
                      <p>
                        Select one of your uploaded texts and start the
                        annotation process. Remember, the LLM is here to help,
                        but you're in control of the final annotations.
                      </p>
                      <p className="mt-2 text-primary font-medium">
                        When you're ready to learn more about exporting your
                        annotated data, switch to the Tips & Tricks tab!
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="text-upload" className="p-4">
                <DrawerHeader>
                  <DrawerTitle>Text Upload</DrawerTitle>
                  <DrawerDescription>
                    Learn how to upload and manage your texts
                  </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-4">
                  <p>
                    First of all in the upper right corner of your screen you
                    should see three tabs:
                  </p>
                  <p className="font-medium">
                    Annotation - Profiles - Text Upload
                  </p>
                  <p>Start by going to the text upload tab.</p>

                  <p>
                    Let's start the tutorial by uploading some data that we can
                    annotate.
                  </p>
                  <Button
                    variant="secondary"
                    className="flex items-center gap-2"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = "/example-echos.xlsx";
                      link.download = "example-echos.xlsx";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Download Example Data
                  </Button>

                  <p>
                    Do you have the table? You might want to open it and just
                    take a look. After that come back to the tutorial.
                  </p>
                  <p>
                    Alright, have you seen the table contents? Great. It is just
                    a bunch of echocardiography reports. Let's upload the text
                    to the app.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Creating a New Text Set</p>
                      <p>
                        In the Text Upload Tab click on the{" "}
                        <span className="font-semibold">New Text Set</span>{" "}
                        Button. This lets you name how the texts that we upload
                        will be stored.
                      </p>
                      <p>
                        You might just want to give a name like{" "}
                        <span className="font-semibold">Echoreports</span>, or{" "}
                        <span className="font-semibold">Test Texts</span>. You
                        can also provide a short description if you like. Click
                        the <span className="font-semibold">Save</span> button
                        to create the Text Set.
                      </p>
                    </div>

                    <div>
                      <p className="font-medium">Uploading Your Texts</p>
                      <p>
                        Now you can start uploading. Click the{" "}
                        <span className="font-semibold">upload</span> Button. It
                        lets you chose between different options on how to
                        upload the texts. We have our texts in a table, so you
                        can chose the{" "}
                        <span className="font-semibold">upload table</span>{" "}
                        option.
                      </p>
                      <p>
                        Now a Window opens that lets you select a table to
                        upload. Go to the place where the example echo table you
                        just downloaded is stored, probably the{" "}
                        <span className="font-semibold">Downloads</span> folder.
                      </p>
                    </div>

                    <div>
                      <p className="font-medium">Selecting Columns</p>
                      <p>
                        After you selected the table for upload a new window
                        opens that lets you select which columns of the table to
                        import.
                      </p>
                      <p>
                        First you select the{" "}
                        <span className="font-semibold">index column</span>.
                        After this column the texts that you upload will be
                        named in the app. In this table the index column is
                        called <span className="font-semibold">Index</span>.
                      </p>
                      <p>
                        Then you select the{" "}
                        <span className="font-semibold">text column</span>. This
                        is the column that the texts are actually stored in. In
                        this table it is just named{" "}
                        <span className="font-semibold">Text</span>.
                      </p>
                      <p>
                        After you selected both columns, you can use import the
                        Texts by clicking the{" "}
                        <span className="font-semibold">Import Texts</span>{" "}
                        button.
                      </p>
                    </div>

                    <div>
                      <p className="font-medium">Viewing Your Texts</p>
                      <p>
                        Very good! Now the text got imported. You are seeing a
                        list of the imported Texts now. When you click on the
                        the text is displayed.
                      </p>
                      <p>
                        You can take some time and take a look at the texts.
                        After that we will continue with the{" "}
                        <span className="font-semibold">AI Setup</span>. You can
                        switch to the{" "}
                        <span className="font-semibold">AI Setup</span> Tab of
                        the Tutorial.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="ai-setup" className="p-4">
                <DrawerHeader>
                  <DrawerTitle>AI Setup</DrawerTitle>
                  <DrawerDescription>
                    Configure AI assistance for your annotation workflow
                  </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Bot className="h-5 w-5 mt-1 text-primary" />
                      <div>
                        <p className="font-medium mb-2">
                          What is a Large Language Model?
                        </p>
                        <p>
                          Raki uses a Large Language Model for AI assistance. A
                          Large Language Model (LLM) is an AI Model, like the
                          one that powers ChatGPT. It basically ingests text and
                          outputs texts. We will tell the LLM to find certain
                          datapoints in our text.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 mt-1 text-primary" />
                      <div>
                        <p className="font-medium mb-2">Setting Up Your LLM</p>
                        <p>
                          You will need to provide an LLM for Raki to use. That
                          sounds scary but it is quite straightforward!
                        </p>
                        <p>
                          In this part of the Tutorial we will create an OpenAI
                          Account, create an API Key and then configure Raki to
                          use a LLM from OpenAI!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Settings className="h-5 w-5 mt-1 text-primary" />
                      <div>
                        <p className="font-medium mb-2">Accessing the Setup</p>
                        <p>
                          In the upper left corner is a{" "}
                          <span className="font-semibold">Menu Button</span>.
                          Click on it and then select the option{" "}
                          <span className="font-semibold">Setup</span>.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p>
                        Now you can see a bunch of information that you need to
                        provide. We will need some credentials and we will get
                        them from OpenAI.
                      </p>

                      <div className="bg-muted p-4 rounded-md space-y-3">
                        <p className="font-medium">
                          Getting Started with OpenAI
                        </p>
                        <p>
                          Go to{" "}
                          <a
                            href="https://platform.openai.com/docs/overview"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            https://platform.openai.com/docs/overview
                          </a>
                        </p>
                        <p>
                          This is the OpenAI Developer Platform. You are almost
                          a coder now! 😉
                        </p>
                      </div>

                      <div className="space-y-3">
                        <p>In the upper right corner you can sign up.</p>
                        <p>
                          Create an account of your choosing. You will also need
                          to provide a measure of payment in the process. Using
                          LLMs does cost money. But the prices are actually
                          super cheap!
                        </p>

                        <div className="bg-muted p-4 rounded-md">
                          <p className="font-medium mb-2">
                            Pricing Information
                          </p>
                          <p>
                            We will use{" "}
                            <span className="font-semibold">gpt-4o-mini</span>,
                            which currently provides really good performance for
                            money. It only costs{" "}
                            <span className="font-semibold">0.15$</span> to
                            upload a million tokens, which is equivalent to a
                            very long novel.
                          </p>
                          <p className="mt-2">
                            So for uploading this test data you will probably
                            spend a cent or less 😊
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Settings className="h-5 w-5 mt-1 text-primary" />
                          <div>
                            <p className="font-medium mb-2">
                              Accessing the Dashboard
                            </p>
                            <p>
                              After you created an account log in. Then on the
                              starting page you will find in the upper right
                              corner the Option{" "}
                              <span className="font-semibold">Dashboard</span>.
                              Go to the dashboard.
                            </p>
                          </div>
                        </div>

                        <div className="bg-muted p-4 rounded-md space-y-3">
                          <p className="font-medium">Understanding API Keys</p>
                          <p>
                            Here on the dashboard you have a lot of control
                            options. What we need to do is to enable you to use
                            an LLM from OpenAI. It works the following: OpenAI
                            has their trained ready to use LLMs running on their
                            servers. You can send a request to these servers.
                            For example you can ask the model: What should not
                            be missing on a hamburger?
                          </p>
                          <p>
                            Now, the server the model is running on needs
                            electricity to run. So running the model actually
                            costs money. So naturally OpenAI wants to earn
                            something by telling you what can't be missing on a
                            hamburger.
                          </p>
                          <p>
                            The server needs a way to determine who that request
                            is coming from in order to bill you a hundreds of a
                            cent or so to answer your request.
                          </p>
                          <p>
                            For that purpose a so called API key is used. We
                            will create one now on the OpenAI Website. This key
                            is then linked to your account.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <p className="font-medium">Creating Your API Key</p>
                          <p>
                            So as said, go to the{" "}
                            <span className="font-semibold">Dashboard</span>.
                            Then in the navigation bar on the left at the very
                            bottom there is the option{" "}
                            <span className="font-semibold">API Keys</span>. Go
                            to it.
                          </p>
                          <p>
                            Then use the{" "}
                            <span className="font-semibold">
                              Create New Secret Key
                            </span>{" "}
                            button. Give the key a name and create it.
                          </p>

                          <div className="bg-muted p-4 rounded-md">
                            <p className="font-medium mb-2">
                              ⚠️ Important: Save Your Key
                            </p>
                            <p>
                              Now really important you need to save your key
                              somewhere. I usually just create a document on my
                              desktop, call it API-key.docs or whatever and copy
                              the key inside.
                            </p>
                            <p>
                              You cannot access the key after this anymore. But
                              you can always create new keys. So it is not too
                              bad if you lose your key 😉
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-muted p-4 rounded-md">
                            <p className="font-medium mb-2">
                              Ready to Configure Raki
                            </p>
                            <p>Alright, do you have your key ready? Great!</p>
                            <p>Let's configure Raki to use it 😊</p>
                          </div>

                          <div className="space-y-3">
                            <p className="font-medium">Setting Up Raki</p>
                            <p>
                              On the Raki App go to the{" "}
                              <span className="font-semibold">Setup</span>{" "}
                              again.
                            </p>
                            <p>Now let's set all the required options:</p>

                            <div className="space-y-2 pl-4">
                              <p>
                                1. For the{" "}
                                <span className="font-semibold">
                                  LLM Provider
                                </span>{" "}
                                we want to select{" "}
                                <span className="font-semibold">OpenAI</span>.
                              </p>
                              <p>
                                2. Then we need to decide which model we want to
                                use. OpenAI provides a number of models and
                                constantly releases new and better ones.
                              </p>
                            </div>

                            <div className="bg-muted p-4 rounded-md">
                              <p className="font-medium mb-2">
                                Model Selection
                              </p>
                              <p>
                                At the writing of this tutorial{" "}
                                <span className="font-semibold">
                                  gpt-4o-mini
                                </span>{" "}
                                offered great performance for cost, so we are
                                going to use it.
                              </p>
                              <p className="mt-2">
                                You can always check the models currently
                                available and their pricing on{" "}
                                <a
                                  href="https://platform.openai.com/docs/pricing"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  https://platform.openai.com/docs/pricing
                                </a>
                              </p>
                            </div>

                            <div className="space-y-3">
                              <p>
                                So in the model name option you can just copy{" "}
                                <span className="font-semibold">
                                  gpt-4o-mini
                                </span>
                              </p>

                              <div className="bg-muted p-4 rounded-md">
                                <p className="font-medium mb-2">
                                  LLM URL Configuration
                                </p>
                                <p>
                                  Then next up is the{" "}
                                  <span className="font-semibold">LLM Url</span>
                                  . This is the address of the server we are
                                  sending our requests to. As we are using
                                  OpenAI we do not need to set this option. The
                                  app will actually do it for you in the
                                  background, as the URL is always the same when
                                  using OpenAI.
                                </p>
                                <p className="mt-2">
                                  This option is only important if you are using
                                  one of the other options for the LLM Provider.
                                </p>
                              </div>

                              <div className="space-y-2">
                                <p>
                                  Ok, then lastly you need to set the{" "}
                                  <span className="font-semibold">API Key</span>
                                  . In there you copy the key you saved earlier.
                                </p>
                                <p>
                                  Don't forget to press the{" "}
                                  <span className="font-semibold">Set</span>{" "}
                                  buttons for the options to save your settings
                                  😊
                                </p>
                                <p>
                                  Ok, the other options that are there we don't
                                  need to change right now.
                                </p>
                              </div>

                              <div className="bg-muted p-4 rounded-md">
                                <p className="font-medium mb-2">
                                  🎉 Congratulations!
                                </p>
                                <p>
                                  You just configured Raki to use a Large
                                  Language Model!
                                </p>
                                <p className="mt-2">
                                  Up next we will put the Large Language Model
                                  to the test and use it to help us to create a
                                  profile for data to extract from our text we
                                  uploaded.
                                </p>
                                <p className="mt-4 text-primary font-medium">
                                  Now you can switch to the Profile Tab of the
                                  tutorial and we can continue (:
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="tips" className="p-4">
                <DrawerHeader>
                  <DrawerTitle>Tips & Tricks</DrawerTitle>
                  <DrawerDescription>
                    Pro tips to enhance your workflow
                  </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-4">
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      🎯 Use keyboard shortcuts for faster annotation
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      📝 Keep your data points well-organized
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">🔄 Regularly save your work</p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default TutorialDrawer;
