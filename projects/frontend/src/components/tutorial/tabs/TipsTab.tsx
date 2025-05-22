import {
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

const TipsTab = () => {
  return (
    <div className="p-4">
      <DrawerHeader>
        <DrawerTitle>Tips &amp; Tricks</DrawerTitle>
        <DrawerDescription>Pro tips to enhance your workflow</DrawerDescription>
      </DrawerHeader>
      <div className="space-y-4">
        <div className="bg-muted p-3 rounded-md">
          <p className="text-sm">
            🎯 Use keyboard shortcuts for faster annotation
          </p>
        </div>
        <div className="bg-muted p-3 rounded-md">
          <p className="text-sm">📝 Keep your data points well-organized</p>
        </div>
        <div className="bg-muted p-3 rounded-md">
          <p className="text-sm">🔄 Regularly save your work</p>
        </div>
      </div>
    </div>
  );
};

export default TipsTab;
