import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProfileList from "./ProfileList";
import DataPointList from "./DataPointList";
import DataPointEditor from "./DataPointEditor";

const Profiles = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <ProfileList />
      <DataPointList />
      <DataPointEditor />
    </div>
  );
};

export default Profiles;
