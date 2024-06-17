import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createProfile, deleteProfile, readAllProfiles } from "@/lib/db/crud";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { TiDelete, TiDeleteOutline } from "react-icons/ti";
import { ProfileListProps } from "../../types";
import ProfileCard from "./ProfileCard";

const ProfileList = (props: ProfileListProps) => {
  const { activeProfile, setActiveProfile } = props;

  const [addingProfile, setAddingProfile] = useState(false);
  const [addProfileName, setAddProfileName] = useState("");
  const [addProfileDescription, setAddProfileDescription] = useState("");

  const dbProfiles = useLiveQuery(() => readAllProfiles());
  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader className="flex flex-row">
          <CardTitle>Profiles</CardTitle>
          <div className="flex-grow"></div>
          <Button onClick={() => setAddingProfile(true)}>Add</Button>
        </CardHeader>
        <CardContent>
          {addingProfile && (
            <Card>
              <CardHeader>
                <CardDescription>New Profile</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Input
                  placeholder="Name"
                  value={addProfileName}
                  onChange={(e) => setAddProfileName(e.target.value)}
                />
                <Input
                  placeholder="Description"
                  value={addProfileDescription}
                  onChange={(e) => setAddProfileDescription(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex flex-row gap-2">
                <Button
                  onClick={() => {
                    createProfile({
                      name: addProfileName,
                      description: addProfileDescription,
                    });
                    setAddingProfile(false);
                    setAddProfileName("");
                    setAddProfileDescription("");
                  }}
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setAddProfileName("");
                    setAddProfileDescription("");
                    setAddingProfile(false);
                  }}
                >
                  Cancel
                </Button>
              </CardFooter>
            </Card>
          )}
          {dbProfiles &&
            dbProfiles.map((profile) => {
              return (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  activeProfile={activeProfile}
                  setActiveProfile={setActiveProfile}
                />
              );
            })}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileList;