import {
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Download, Shield } from "lucide-react";

const TextUploadTab = () => {
  return (
    <div className="p-4">
      <DrawerHeader>
        <DrawerTitle>Text Upload</DrawerTitle>
        <DrawerDescription>
          Learn how to upload and manage your texts with privacy protection
        </DrawerDescription>
      </DrawerHeader>
      <div className="space-y-4">
        <p>
          First of all in the upper right corner of your screen you should see
          three tabs:
        </p>
        <p className="font-medium">Annotation - Profiles - Text Upload</p>
        <p>Start by going to the text upload tab.</p>

        <p>
          Let&apos;s start the tutorial by uploading some data that we can
          annotate. This time we&apos;ll use a dataset that contains sensitive
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

        <p>
          Do you have the table? You might want to open it and just take a look.
          You&apos;ll notice this dataset contains patient names and dates of
          birth alongside the medical reports - exactly the kind of sensitive
          data that needs protection.
        </p>
        <p>
          Alright, have you seen the table contents? Great! This dataset
          contains echocardiography reports with patient identifiers. Let&apos;s
          upload the text to the app while protecting patient privacy.
        </p>

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
            <p>
              Now a Window opens that lets you select a table to upload. Go to
              the place where the example echo table you just downloaded is
              stored, probably the{" "}
              <span className="font-semibold">Downloads</span> folder.
            </p>
          </div>

          <div>
            <p className="font-medium">Selecting Columns</p>
            <p>
              After you selected the table for upload a new window opens that
              lets you select which columns of the table to import.
            </p>
            <p>
              First you select the{" "}
              <span className="font-semibold">index column</span>. After this
              column the texts that you upload will be named in the app. In this
              table the index column is called{" "}
              <span className="font-semibold">Index</span>.
            </p>
            <p>
              Then you select the{" "}
              <span className="font-semibold">text column</span>. This is the
              column that the texts are actually stored in. In this table it is
              just named <span className="font-semibold">Text English</span> or{" "}
              <span className="font-semibold">Text German</span> if you prefer
              German.
            </p>
            <p>
              After you selected both columns, you can import the Texts by
              clicking the <span className="font-semibold">Import Texts</span>{" "}
              button.
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
                <p className="font-medium text-blue-900">
                  Step 1: Enable Anonymisation
                </p>
                <p className="text-blue-800">
                  Before selecting your columns, click the{" "}
                  <span className="font-semibold">Start Anonymisation</span>{" "}
                  button. This will highlight the table headers in yellow,
                  indicating anonymisation mode is active.
                </p>
              </div>

              <div>
                <p className="font-medium text-blue-900">
                  Step 2: Select Sensitive Columns
                </p>
                <p className="text-blue-800">
                  Click on the column headers that contain sensitive
                  information:
                </p>
                <ul className="list-disc list-inside text-blue-800 ml-4 space-y-1">
                  <li>
                    <span className="font-semibold">first_name</span> - Contains
                    patient first names
                  </li>
                  <li>
                    <span className="font-semibold">last_name</span> - Contains
                    patient last names
                  </li>
                  <li>
                    <span className="font-semibold">dob</span> - Contains
                    patient dates of birth
                  </li>
                </ul>
                <p className="text-blue-800 mt-2">
                  Selected columns will be highlighted in yellow. You can click
                  again to deselect if needed.
                </p>
              </div>

              <div>
                <p className="font-medium text-blue-900">
                  Step 3: Select Index and Text Columns
                </p>
                <p className="text-blue-800">
                  Now proceed with the normal column selection:
                </p>
                <ul className="list-disc list-inside text-blue-800 ml-4 space-y-1">
                  <li>
                    Click{" "}
                    <span className="font-semibold">Select Index Column</span>{" "}
                    then click the <span className="font-semibold">Index</span>{" "}
                    column
                  </li>
                  <li>
                    Click{" "}
                    <span className="font-semibold">Select Text Column</span>{" "}
                    then click the <span className="font-semibold">Text</span>{" "}
                    column
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-blue-900">
                  Step 4: Import with Anonymisation
                </p>
                <p className="text-blue-800">
                  Click <span className="font-semibold">Import Texts</span>. The
                  system will automatically:
                </p>
                <ul className="list-disc list-inside text-blue-800 ml-4 space-y-1">
                  <li>
                    Replace all patient names and DOBs with{" "}
                    <span className="font-semibold">[REDACTED]</span>
                  </li>
                  <li>Preserve the medical content for analysis</li>
                  <li>Import the anonymised texts into your dataset</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-300">
              <p className="text-blue-900 text-sm">
                <span className="font-semibold">💡 Tip:</span> You can always
                exit anonymisation mode by clicking
                <span className="font-semibold"> Exit Anonymisation</span> if
                you change your mind, or if your data doesn&apos;t contain
                sensitive information.
              </p>
            </div>
          </div>

          <div>
            <p className="font-medium">Viewing Your Anonymised Texts</p>
            <p>
              Very good! Now the texts have been imported with sensitive
              information automatically redacted. You are seeing a list of the
              imported texts now. When you click on a text, you&apos;ll notice
              that patient names and dates of birth have been replaced with{" "}
              <span className="font-semibold">[REDACTED]</span>.
            </p>
            <p>
              The medical content remains intact for analysis, but patient
              privacy is protected. You can take some time and take a look at
              the anonymised texts. After that we will continue with the{" "}
              <span className="font-semibold">AI Setup</span>. You can switch to
              the <span className="font-semibold">AI Setup</span> Tab of the
              Tutorial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextUploadTab;
