import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ProfileList = () => {
  const profiles = [
    {
      id: 1,
      name: "Profile 1",
      description: "Profile description",
    },
    {
      id: 2,
      name: "Profile 2",
      description: "Profile description",
    },
    {
      id: 3,
      name: "Profile 3",
      description: "Profile description",
    },
  ];
  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row">
          <CardTitle>Profiles</CardTitle>
          <div className="flex-grow"></div>
          <Button>Add</Button>
        </CardHeader>
        <CardContent>
          {profiles.map((profile) => {
            return (
              <Card key={profile.id}>
                <CardHeader>
                  <CardTitle>{profile.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{profile.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileList;
