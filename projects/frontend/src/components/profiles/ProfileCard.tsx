import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  deleteProfile,
  readProfilePointsByProfile,
  readSegmentationProfilePointsByProfile,
} from "@/lib/db/crud";
import DeleteButton from "@/components/DeleteButton";
import EditButton from "@/components/EditButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProfileCardProps } from "@/app/types";
import { Button } from "@/components/ui/button";
import { TiDownloadOutline } from "react-icons/ti";
import { TASK_MODE } from "@/app/constants";

const ProfileCard = (props: ProfileCardProps) => {
  const {
    profile,
    activeProfile,
    setActiveProfile,
    setEditingProfile,
    "data-cy": dataCy,
  } = props;

  // Function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const handleDownloadProfile = async () => {
    try {
      // Fetch profile points based on mode
      const profilePoints =
        profile.mode === TASK_MODE.TEXT_SEGMENTATION
          ? await readSegmentationProfilePointsByProfile(profile.id)
          : await readProfilePointsByProfile(profile.id);

      // Create the complete profile data
      const profileData = {
        profile: {
          name: profile.name,
          description: profile.description,
          mode: profile.mode,
          example: profile.example,
        },
        profilePoints: profilePoints.map((point) => {
          const { id, profileId, ...rest } = point;
          return rest;
        }),
      };

      // Convert to JSON and download
      const jsonData = JSON.stringify(profileData, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${profile.name}_profile.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading profile:", error);
    }
  };

  return (
    <Card
      key={profile.id}
      className={`${
        activeProfile == profile &&
        "bg-gray-100 shadow-lg border-black border-2"
      } transition-transform hover:bg-gray-100 hover:shadow-lg transform`}
      onClick={() => setActiveProfile(profile)}
      data-cy={dataCy}
    >
      <CardHeader className="flex flex-row gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className="truncate max-w-[200px]">
                {truncateText(profile.name, 20)}
              </CardTitle>
            </TooltipTrigger>
            <TooltipContent>
              <p>{profile.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex-grow"></div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleDownloadProfile();
          }}
          data-cy="download-profile-button"
          title="Download Profile"
        >
          <TiDownloadOutline className="h-4 w-4" />
        </Button>
        <EditButton
          onClick={(e) => {
            e.stopPropagation();
            setEditingProfile(profile);
          }}
          data-cy="edit-profile-button"
        />
        <DeleteButton
          onDelete={() => deleteProfile(profile.id)}
          itemName="profile"
          data-cy="delete-profile-button"
        />
      </CardHeader>
      <CardContent>
        <CardDescription>{profile.description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
