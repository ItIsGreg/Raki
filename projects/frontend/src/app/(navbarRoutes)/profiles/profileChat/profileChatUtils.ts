import { ProfilePoint, ProfilePointCreate, Profile } from "@/lib/db/db";

/**
 * Validates if an object conforms to the ProfilePointCreate interface
 * @param obj The object to validate
 * @returns True if the object is a valid ProfilePointCreate
 */
export const isProfilePointCreate = (obj: any): obj is ProfilePointCreate => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.name === "string" &&
    typeof obj.explanation === "string" &&
    Array.isArray(obj.synonyms) &&
    typeof obj.datatype === "string" &&
    (obj.valueset === undefined || Array.isArray(obj.valueset)) &&
    (obj.unit === undefined || typeof obj.unit === "string")
  );
};

/**
 * Extracts profile points from a message content string
 * @param content The message content to parse
 * @returns Array of valid ProfilePointCreate objects
 */
export const extractProfilePoints = (
  content: string
): ProfilePointCreate[] => {
  const points: ProfilePointCreate[] = [];
  const JSON_REGEX = /```json\n([\s\S]*?)```/g;
  const parts = content.split(JSON_REGEX);

  parts.forEach((part, index) => {
    if (index % 4 !== 0 && part) {
      try {
        const jsonString = (
          part.startsWith("```json") ? parts[index + 1] : part
        )
          .trim()
          .replace(/:\s*undefined\s*/g, ": null")
          .replace(/:\s*"undefined"\s*/g, ": null");

        const parsedJson = JSON.parse(jsonString);
        const cleanedJson = Object.fromEntries(
          Object.entries(parsedJson).filter(([_, value]) => value !== null)
        );

        if (isProfilePointCreate(cleanedJson)) {
          points.push(cleanedJson);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    }
  });

  return points;
};

/**
 * Completes a partial profile point with default values and profile ID
 * @param profilePoint Partial profile point data
 * @param profileId The ID of the profile to associate with the point
 * @returns Complete ProfilePointCreate object
 */
export const completeProfilePoint = (
  profilePoint: Partial<ProfilePointCreate>,
  profileId: string
): ProfilePointCreate => {
  return {
    name: profilePoint.name || "",
    explanation: profilePoint.explanation || "",
    synonyms: profilePoint.synonyms || [],
    datatype: profilePoint.datatype || "",
    valueset: profilePoint.valueset || [],
    unit: profilePoint.unit || "",
    profileId,
  };
};

/**
 * Handles the adoption of a single profile point
 * @param profilePoint The profile point to adopt
 * @param activeProfile The active profile
 * @param createProfilePointFn Function to create profile points
 * @returns Promise with the result of creating the profile point
 */
export const handleAdoptProfilePoint = async (
  profilePoint: Partial<ProfilePointCreate>,
  activeProfile: Profile | undefined,
  createProfilePointFn: (point: ProfilePointCreate) => Promise<any>
): Promise<any> => {
  if (!activeProfile) {
    throw new Error("No active profile");
  }

  const completePoint = completeProfilePoint(profilePoint, activeProfile.id);
  return createProfilePointFn(completePoint);
};

/**
 * Adopts all valid profile points for a given profile
 * @param profilePoints Array of profile points to adopt
 * @param profileId The ID of the profile to associate with the points
 * @param createProfilePointFn Function to create profile points
 * @returns Promise with the results of creating all profile points
 */
export const adoptAllProfilePoints = async (
  profilePoints: ProfilePointCreate[],
  profileId: string,
  createProfilePointFn: (point: ProfilePointCreate) => Promise<any>
): Promise<any[]> => {
  if (!profileId) {
    throw new Error("No active profile ID provided");
  }

  return Promise.all(
    profilePoints.map((point) => {
      const completePoint = completeProfilePoint(point, profileId);
      return createProfilePointFn(completePoint);
    })
  );
};