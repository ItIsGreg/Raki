import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteProfile } from "@/lib/db/crud";
import { ProfileCardProps } from "../../types";
import DeleteButton from "@/components/DeleteButton";
import EditButton from "@/components/EditButton";

const ProfileCard = (props: ProfileCardProps) => {
  const { profile, activeProfile, setActiveProfile, setEditingProfile } = props;
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
        <EditButton
          onClick={(e) => {
            e.stopPropagation();
            setEditingProfile(profile);
          }}
        />
        <DeleteButton
          onDelete={() => deleteProfile(profile.id)}
          itemName="profile"
        />
      </CardHeader>
      <CardContent>
        <CardDescription>{profile.description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
