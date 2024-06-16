import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IoMdDownload } from "react-icons/io";
import { deleteProfile } from "@/lib/db/crud";
import { TiDeleteOutline } from "react-icons/ti";
import { ProfileCardProps } from "../../types";

const ProfileCard = (props: ProfileCardProps) => {
  const { profile, activeProfile, setActiveProfile } = props;
  return (
    <Card
      key={profile.id}
      className={`${
        activeProfile == profile &&
        "bg-gray-100 shadow-lg border-black border-2"
      } transition-transform hover:bg-gray-100 hover:shadow-lg transform`}
      onClick={() => setActiveProfile(profile)}
    >
      <CardHeader className="flex flex-row gap-3">
        <CardTitle>{profile.name}</CardTitle>
        <div className="flex-grow"></div>
        <TiDeleteOutline
          className="hover:text-red-500 cursor-pointer"
          size={24}
          onClick={() => {
            deleteProfile(profile.id);
          }}
        />
      </CardHeader>
      <CardContent>
        <CardDescription>{profile.description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
