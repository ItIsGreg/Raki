import {
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const TextUploadTab = () => {
  return (
    <div className="p-4">
      <DrawerHeader>
        <DrawerTitle>Text Upload</DrawerTitle>
        <DrawerDescription>
          Learn how to upload and manage your texts
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
          Do you have the table? You might want to open it and just take a look.
          After that come back to the tutorial.
        </p>
        <p>
          Alright, have you seen the table contents? Great. It is just a bunch
          of echocardiography reports. Let&apos;s upload the text to the app.
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
              just named <span className="font-semibold">Text</span>.
            </p>
            <p>
              After you selected both columns, you can use import the Texts by
              clicking the <span className="font-semibold">Import Texts</span>{" "}
              button.
            </p>
          </div>

          <div>
            <p className="font-medium">Viewing Your Texts</p>
            <p>
              Very good! Now the text got imported. You are seeing a list of the
              imported Texts now. When you click on the the text is displayed.
            </p>
            <p>
              You can take some time and take a look at the texts. After that we
              will continue with the{" "}
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
