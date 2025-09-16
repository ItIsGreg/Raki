import { Bot, Settings, Sparkles } from "lucide-react";

const AISetupTab = () => {
  return (
    <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Bot className="h-5 w-5 mt-1 text-primary" />
            <div>
              <p className="font-medium mb-2">
                What is a Large Language Model?
              </p>
              <p>
                Raki uses a Large Language Model for AI assistance. A Large
                Language Model (LLM) is an AI Model, like the one that powers
                ChatGPT. It basically ingests text and outputs texts. We will
                tell the LLM to find certain datapoints in our text.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 mt-1 text-primary" />
            <div>
              <p className="font-medium mb-2">Setting Up Your LLM</p>
              <p>
                You will need to provide an LLM for Raki to use. That sounds
                scary but it is quite straightforward!
              </p>
              <p>
                In this part of the Tutorial we will create an OpenAI Account,
                create an API Key and then configure Raki to use a LLM from
                OpenAI!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Settings className="h-5 w-5 mt-1 text-primary" />
            <div>
              <p className="font-medium mb-2">Accessing the Setup</p>
              <p>
                In the upper left corner is a{" "}
                <span className="font-semibold">Menu Button</span>. Click on it
                and then select the option{" "}
                <span className="font-semibold">Setup</span>.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p>
              Now you can see a bunch of information that you need to provide.
              We will need some credentials and we will get them from OpenAI.
            </p>

            <div className="bg-muted p-4 rounded-md space-y-3">
              <p className="font-medium">Getting Started with OpenAI</p>
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
                This is the OpenAI Developer Platform. You are almost a coder
                now! 😉
              </p>
            </div>

            <div className="space-y-3">
              <p>In the upper right corner you can sign up.</p>
              <p>
                Create an account of your choosing. You will also need to
                provide a measure of payment in the process. Using LLMs does
                cost money. But the prices are actually super cheap!
              </p>

              <div className="bg-muted p-4 rounded-md">
                <p className="font-medium mb-2">Pricing Information</p>
                <p>
                  We will use <span className="font-semibold">gpt-4o-mini</span>
                  , which currently provides really good performance for money.
                  It only costs <span className="font-semibold">0.15$</span> to
                  upload a million tokens, which is equivalent to a very long
                  novel.
                </p>
                <p className="mt-2">
                  So for uploading this test data you will probably spend a cent
                  or less 😊
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <p className="font-medium mb-2">Accessing the Dashboard</p>
                  <p>
                    After you created an account log in. Then on the starting
                    page you will find in the upper right corner the Option{" "}
                    <span className="font-semibold">Dashboard</span>. Go to the
                    dashboard.
                  </p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-md space-y-3">
                <p className="font-medium">Understanding API Keys</p>
                <p>
                  Here on the dashboard you have a lot of control options. What
                  we need to do is to enable you to use an LLM from OpenAI. It
                  works the following: OpenAI has their trained ready to use
                  LLMs running on their servers. You can send a request to these
                  servers. For example you can ask the model: What should not be
                  missing on a hamburger?
                </p>
                <p>
                  Now, the server the model is running on needs electricity to
                  run. So running the model actually costs money. So naturally
                  OpenAI wants to earn something by telling you what can&apos;t
                  be missing on a hamburger.
                </p>
                <p>
                  The server needs a way to determine who that request is coming
                  from in order to bill you a hundreds of a cent or so to answer
                  your request.
                </p>
                <p>
                  For that purpose a so called API key is used. We will create
                  one now on the OpenAI Website. This key is then linked to your
                  account.
                </p>
              </div>

              <div className="space-y-3">
                <p className="font-medium">Creating Your API Key</p>
                <p>
                  So as said, go to the{" "}
                  <span className="font-semibold">Dashboard</span>. Then in the
                  navigation bar on the left at the very bottom there is the
                  option <span className="font-semibold">API Keys</span>. Go to
                  it.
                </p>
                <p>
                  Then use the{" "}
                  <span className="font-semibold">Create New Secret Key</span>{" "}
                  button. Give the key a name and create it.
                </p>

                <div className="bg-muted p-4 rounded-md">
                  <p className="font-medium mb-2">
                    ⚠️ Important: Save Your Key
                  </p>
                  <p>
                    Now really important you need to save your key somewhere. I
                    usually just create a document on my desktop, call it
                    API-key.docs or whatever and copy the key inside.
                  </p>
                  <p>
                    You cannot access the key after this anymore. But you can
                    always create new keys. So it is not too bad if you lose
                    your key 😉
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <p className="font-medium mb-2">Ready to Configure Raki</p>
                  <p>Alright, do you have your key ready? Great!</p>
                  <p>Let&apos;s configure Raki to use it 😊</p>
                </div>

                <div className="space-y-3">
                  <p className="font-medium">Setting Up Raki</p>
                  <p>
                    On the Raki App go to the{" "}
                    <span className="font-semibold">Setup</span> again.
                  </p>
                  <p>Now let&apos;s set all the required options:</p>

                  <div className="space-y-2 pl-4">
                    <p>
                      1. For the{" "}
                      <span className="font-semibold">LLM Provider</span> we
                      want to select{" "}
                      <span className="font-semibold">OpenAI</span>.
                    </p>
                    <p>
                      2. Then we need to decide which model we want to use.
                      OpenAI provides a number of models and constantly releases
                      new and better ones.
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-md">
                    <p className="font-medium mb-2">Model Selection</p>
                    <p>
                      At the writing of this tutorial{" "}
                      <span className="font-semibold">gpt-4o-mini</span> offered
                      great performance for cost, so we are going to use it.
                    </p>
                    <p className="mt-2">
                      You can always check the models currently available and
                      their pricing on{" "}
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
                      <span className="font-semibold">gpt-4o-mini</span>
                    </p>

                    <div className="bg-muted p-4 rounded-md">
                      <p className="font-medium mb-2">LLM URL Configuration</p>
                      <p>
                        Then next up is the{" "}
                        <span className="font-semibold">LLM Url</span>. This is
                        the address of the server we are sending our requests
                        to. As we are using OpenAI we do not need to set this
                        option. The app will actually do it for you in the
                        background, as the URL is always the same when using
                        OpenAI.
                      </p>
                      <p className="mt-2">
                        This option is only important if you are using one of
                        the other options for the LLM Provider.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p>
                        Ok, then lastly you need to set the{" "}
                        <span className="font-semibold">API Key</span>. In there
                        you copy the key you saved earlier.
                      </p>
                      <p>
                        Don&apos;t forget to press the{" "}
                        <span className="font-semibold">Set</span> buttons for
                        the options to save your settings 😊
                      </p>
                      <p>
                        Ok, the other options that are there we don&apos;t need
                        to change right now.
                      </p>
                    </div>

                    <div className="bg-muted p-4 rounded-md">
                      <p className="font-medium mb-2">🎉 Congratulations!</p>
                      <p>
                        You just configured Raki to use a Large Language Model!
                      </p>
                      <p className="mt-2">
                        Up next we will put the Large Language Model to the test
                        and use it to help us to create a profile for data to
                        extract from our text we uploaded.
                      </p>
                      <p className="mt-4 text-primary font-medium">
                        Now you can switch to the Profile Tab of the tutorial
                        and we can continue (:
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AISetupTab;
