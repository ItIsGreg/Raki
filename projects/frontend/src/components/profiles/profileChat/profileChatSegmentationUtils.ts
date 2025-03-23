import { SegmentationProfilePointCreate, Profile } from "@/lib/db/db";

/**
 * Validates if an object conforms to the SegmentationProfilePointCreate interface
 * @param obj The object to validate
 * @returns True if the object is a valid SegmentationProfilePointCreate
 */
export const isSegmentationProfilePointCreate = (obj: any): obj is SegmentationProfilePointCreate => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.name === "string" &&
    typeof obj.explanation === "string" &&
    Array.isArray(obj.synonyms)
  );
};

/**
 * Extracts segmentation profile points from a message content string
 * @param content The message content to parse
 * @returns Array of valid SegmentationProfilePointCreate objects
 */
export const extractSegmentationProfilePoints = (
  content: string
): SegmentationProfilePointCreate[] => {
  const points: SegmentationProfilePointCreate[] = [];
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

        if (isSegmentationProfilePointCreate(cleanedJson)) {
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
 * Completes a partial segmentation profile point with default values and profile ID
 * @param profilePoint Partial segmentation profile point data
 * @param profileId The ID of the profile to associate with the point
 * @returns Complete SegmentationProfilePointCreate object
 */
export const completeSegmentationProfilePoint = (
  profilePoint: Partial<SegmentationProfilePointCreate>,
  profileId: string
): SegmentationProfilePointCreate => {
  return {
    name: profilePoint.name || "",
    explanation: profilePoint.explanation || "",
    synonyms: profilePoint.synonyms || [],
    profileId,
  };
};

/**
 * Handles the adoption of a single segmentation profile point
 * @param profilePoint The segmentation profile point to adopt
 * @param activeProfile The active profile
 * @param createSegmentationProfilePointFn Function to create segmentation profile points
 * @returns Promise with the result of creating the segmentation profile point
 */
export const handleAdoptSegmentationProfilePoint = async (
  profilePoint: Partial<SegmentationProfilePointCreate>,
  activeProfile: Profile | undefined,
  createSegmentationProfilePointFn: (point: SegmentationProfilePointCreate) => Promise<any>
): Promise<any> => {
  if (!activeProfile) {
    throw new Error("No active profile");
  }

  const completePoint = completeSegmentationProfilePoint(profilePoint, activeProfile.id);
  return createSegmentationProfilePointFn(completePoint);
};

/**
 * Adopts all valid segmentation profile points for a given profile
 * @param profilePoints Array of segmentation profile points to adopt
 * @param profileId The ID of the profile to associate with the points
 * @param createSegmentationProfilePointFn Function to create segmentation profile points
 * @returns Promise with the results of creating all segmentation profile points
 */
export const adoptAllSegmentationProfilePoints = async (
  profilePoints: SegmentationProfilePointCreate[],
  profileId: string,
  createSegmentationProfilePointFn: (point: SegmentationProfilePointCreate) => Promise<any>
): Promise<any[]> => {
  if (!profileId) {
    throw new Error("No active profile ID provided");
  }

  return Promise.all(
    profilePoints.map((point) => {
      const completePoint = completeSegmentationProfilePoint(point, profileId);
      return createSegmentationProfilePointFn(completePoint);
    })
  );
};
