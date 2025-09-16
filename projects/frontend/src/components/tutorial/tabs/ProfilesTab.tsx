import { Sparkles } from "lucide-react";

const ProfilesTab = () => {
  return (
    <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 mt-1 text-primary" />
            <div>
              <p className="font-medium mb-2">
                Let&apos;s Start the Real Deal!
              </p>
              <p>
                We want to extract data from our texts. We uploaded some
                echocardiography reports, which are reports from ultrasound
                examinations of the heart. If you are a medical professional
                this will probably tell you something. If not, it is not too
                bad! We will work through it 😊
              </p>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-medium mb-2">
              Understanding Echocardiography Reports
            </p>
            <p>
              The echocardiography report contains a number of measurements, for
              example:
            </p>
            <ul className="list-disc pl-4 mt-2 space-y-1">
              <li>How good the heart is pumping (the ejection fraction)</li>
              <li>If all the heart valves are okay or if some are leaky</li>
            </ul>
            <p className="mt-2">
              We can tell the Large Language Model to look for these
              measurements in the text.
            </p>
          </div>

          <div className="space-y-3">
            <p>
              We do this by creating a profile. And then in the profile we will
              create some datapoints.
            </p>

            <div className="space-y-2">
              <p className="font-medium">Creating Your First Profile</p>
              <p>
                Next to the <span className="font-semibold">Text Upload</span>{" "}
                Tab is the <span className="font-semibold">Profiles</span> Tab
                in the upper right corner. This is where we want to go to now.
              </p>
              <p>
                You will find there a{" "}
                <span className="font-semibold">Plus</span> button, that lets
                you create a new profile. Go ahead and click it.
              </p>
              <p>
                You need to provide a name and a description if you like. You
                can just call the profile{" "}
                <span className="font-semibold">Tutorial-Echocardiography</span>{" "}
                for example. Click <span className="font-semibold">Save</span>.
                Great!
              </p>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <p className="font-medium mb-2">🤖 Time to Use Our LLM!</p>
              <p>
                Now let&apos;s continue by creating the profile points that we
                want to extract from the texts. And this is the first time that
                our Large Language Model comes into play.
              </p>
              <p className="mt-2">
                In the <span className="font-semibold">Data Points</span> Tab
                you will see a <span className="font-semibold">Plus</span>{" "}
                Button and a <span className="font-semibold">Chat</span> Button.
                Go ahead and click the Chat button and we can let the LLM create
                Profile Points for us.
              </p>
            </div>

            <div className="space-y-3">
              <p>
                You can just chat normally, like you do with ChatGPT. The
                specialty is that the model got primed to create profile points
                for us if we ask it to.
              </p>

              <div className="bg-muted p-4 rounded-md">
                <p className="font-medium mb-2">Try This Command</p>
                <p>
                  Create profile points for Echocardiography. Create the profile
                  points LVEF, Pericardial Effusion, Mitral Insufficiency,
                  Tricuspid Insufficiency, Aortic Stenosis
                </p>
              </div>

              <p>
                See what happens. The LLM is now creating profile points for us.
                The output may look a bit chunky. This is because in the
                background we told the model how the output needs to look like,
                so that we can continue using it in our app.
              </p>
              <p>
                After the LLM finished generating you can just click on{" "}
                <span className="font-semibold">adopt all</span> and Boom! The
                profile points are in our list! 🎉
              </p>
            </div>

            <div className="space-y-4 mt-6">
              <div>
                <p className="font-medium mb-2">Understanding Profile Points</p>
                <p>
                  Alright, lets take a look at the profile points that were
                  created. You can click through them. Take a look at the
                  editor. You can see what the llm created. For each Datapoint a
                  name is provided. Furthermore there is an explanation,
                  synonyms, the datatype can be defined, and even the unit of
                  the datapoint, if it has one.
                </p>
              </div>

              <div>
                <p>
                  All these information we provide so that the LLM knows what to
                  look for in the texts it will analyse. Especially the
                  explanation and synonyms are important.
                </p>
                <p className="mt-2">
                  By carefully adding synonyms and providing information in the
                  explanation you suppor the LLM in extracting datapoints from
                  the texts!
                </p>
              </div>

              <div>
                <p>
                  If you are an expert in echocardiography feel free to modify
                  the synonyms and explanations of the datapoints. But no
                  stress. The datapoint we have right now should be fully
                  sufficient to see the app in action.
                </p>
              </div>

              <div>
                <p>
                  Great! Now we have already used the Large Language Model.
                  Furthermore we created Profile Points that we can now use to
                  extract data from our texts. How exciting is that?!
                </p>
                <p className="mt-2">
                  Let us continue now by actually using the LLM to extract them
                  datapoints ;)
                </p>
              </div>

              <div className="bg-muted p-4 rounded-md">
                <p className="text-primary font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Go to the Tab Annotation in the Tutorial if you are ready to
                  continue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ProfilesTab;
