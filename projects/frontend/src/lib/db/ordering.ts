import { db } from "./db";
import { ProfilePoint, SegmentationProfilePoint } from "./db";

const ORDER_GAP = 1000;
const MIN_GAP = 10;

type Point = ProfilePoint | SegmentationProfilePoint;

export async function getNextOrderNumber(profileId: string, isSegmentation: boolean): Promise<number> {
  const table = isSegmentation ? db.segmentationProfilePoints : db.profilePoints;
  const points = await table.where("profileId").equals(profileId).toArray();
  
  if (points.length === 0) {
    return ORDER_GAP;
  }
  
  const maxOrder = Math.max(...points.map(p => p.order || 0));
  return maxOrder + ORDER_GAP;
}

export function needsRenumbering(prevOrder: number, nextOrder: number): boolean {
  return nextOrder - prevOrder < MIN_GAP;
}

export async function renumberPoints(
  points: Point[],
  isSegmentation: boolean
): Promise<void> {
  const table = isSegmentation ? db.segmentationProfilePoints : db.profilePoints;
  
  // Sort points by current order
  const sortedPoints = [...points].sort((a, b) => (a.order || 0) - (b.order || 0));
  
  // Assign new order numbers
  sortedPoints.forEach((point, index) => {
    point.order = (index + 1) * ORDER_GAP;
    point.previousPointId = index > 0 ? sortedPoints[index - 1].id : null;
    point.nextPointId = index < sortedPoints.length - 1 ? sortedPoints[index + 1].id : null;
  });
  
  // Save all points
  await db.transaction('rw', table, async () => {
    for (const point of sortedPoints) {
      await table.put(point);
    }
  });
}

export async function reorderPoint(
  movedPoint: Point,
  newPrevPoint: Point | null,
  newNextPoint: Point | null,
  isSegmentation: boolean
): Promise<void> {
  const table = isSegmentation ? db.segmentationProfilePoints : db.profilePoints;
  
  // Update linked list pointers
  movedPoint.previousPointId = newPrevPoint?.id ?? null;
  movedPoint.nextPointId = newNextPoint?.id ?? null;
  
  if (newPrevPoint) {
    newPrevPoint.nextPointId = movedPoint.id;
  }
  if (newNextPoint) {
    newNextPoint.previousPointId = movedPoint.id;
  }
  
  // Calculate new order number
  const prevOrder = newPrevPoint?.order ?? 0;
  const nextOrder = newNextPoint?.order ?? Number.MAX_SAFE_INTEGER;
  
  if (needsRenumbering(prevOrder, nextOrder)) {
    // Get all points in the affected range
    const points = await table
      .where("profileId")
      .equals(movedPoint.profileId)
      .and(point => (point.order || 0) >= prevOrder && (point.order || 0) <= nextOrder)
      .toArray();
    
    await renumberPoints(points, isSegmentation);
  } else {
    movedPoint.order = Math.floor((prevOrder + nextOrder) / 2);
  }
  
  // Save all changes
  const pointsToSave = [movedPoint, newPrevPoint, newNextPoint].filter(Boolean) as Point[];
  await db.transaction('rw', table, async () => {
    for (const point of pointsToSave) {
      await table.put(point);
    }
  });
}

export async function getOrderedPoints(
  profileId: string,
  isSegmentation: boolean
): Promise<Point[]> {
  const table = isSegmentation ? db.segmentationProfilePoints : db.profilePoints;
  return table
    .where("profileId")
    .equals(profileId)
    .sortBy("order");
} 