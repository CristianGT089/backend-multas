export interface IFineStatusUpdate {
    lastUpdatedTimestamp: string;
    oldState: number;
    newState: number;
    reason: string;
    updatedBy: string;
}