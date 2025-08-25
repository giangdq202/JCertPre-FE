export enum ItemStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2,
  Locked = 3,
}

export interface StudyPlanItemDto {
  itemId: string;
  planId: string;
  sequence: number;
  itemType: string;
  courseId?: string;
  testTemplateTypeId?: string;
  status: ItemStatus;
}

export interface UpdateStudyPlanItemDto {
  sequence?: number;
  itemType?: string;
  courseId?: string;
  testTemplateTypeId?: string;
  status?: ItemStatus;
}
