import { db } from "./db";
import { ProfilePoint, SegmentationProfilePoint } from "./db";

const ORDER_GAP = 1000;
const MIN_GAP = 10;

type Point = {
  id: string;
  profileId: string;
  order?: number;
  previousPointId?: string | null;
  nextPointId?: string | null;
};

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
      const existingPoint = await table.get(point.id);
      if (existingPoint) {
        await table.put({
          ...existingPoint,
          order: point.order,
          previousPointId: point.previousPointId,
          nextPointId: point.nextPointId,
        });
      }
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
  
  // Get the existing points
  const existingMovedPoint = await table.get(movedPoint.id);
  const existingPrevPoint = newPrevPoint ? await table.get(newPrevPoint.id) : null;
  const existingNextPoint = newNextPoint ? await table.get(newNextPoint.id) : null;

  if (!existingMovedPoint) {
    console.error('Moved point not found in database');
    return;
  }
  
  // Update linked list pointers
  const updatedMovedPoint = {
    ...existingMovedPoint,
    previousPointId: newPrevPoint?.id ?? null,
    nextPointId: newNextPoint?.id ?? null,
  };
  
  // Calculate new order number
  const prevOrder = existingPrevPoint?.order ?? 0;
  const nextOrder = existingNextPoint?.order ?? Number.MAX_SAFE_INTEGER;

  if (needsRenumbering(prevOrder, nextOrder)) {
    // Get all points in the affected range
    const points = await table
      .where("profileId")
      .equals(movedPoint.profileId)
      .and(point => (point.order || 0) >= prevOrder && (point.order || 0) <= nextOrder)
      .toArray();
    
    // Add the moved point to the points array if it's not already there
    if (!points.find(p => p.id === movedPoint.id)) {
      points.push(existingMovedPoint);
    }
    
    await renumberPoints(points, isSegmentation);
  } else {
    const newOrder = Math.floor((prevOrder + nextOrder) / 2);
    updatedMovedPoint.order = newOrder;
  }
  
  // Update the previous point's next pointer
  if (existingPrevPoint) {
    existingPrevPoint.nextPointId = movedPoint.id;
  }
  
  // Update the next point's previous pointer
  if (existingNextPoint) {
    existingNextPoint.previousPointId = movedPoint.id;
  }
  
  // Save all changes in a transaction
  await db.transaction('rw', table, async () => {
    // Save the moved point
    await table.put(updatedMovedPoint);
    
    // Save the previous point if it exists
    if (existingPrevPoint) {
      await table.put(existingPrevPoint);
    }
    
    // Save the next point if it exists
    if (existingNextPoint) {
      await table.put(existingNextPoint);
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