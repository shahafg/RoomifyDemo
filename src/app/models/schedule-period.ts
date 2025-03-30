export class SchedulePeriod {
    private id: number;
    private periodName: string;
    private startTime: string;
    private endTime: string;
    private subject: string;
    private originalStartTime?: string;
    private originalEndTime?: string;

    constructor(id: number, periodName: string, startTime: string, endTime: string, subject: string, originalStartTime?: string, originalEndTime?: string) {
        this.id = id;
        this.periodName = periodName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.subject = subject;
        this.originalStartTime = originalStartTime;
        this.originalEndTime = originalEndTime;
    }

    public getId(): number {
        return this.id;
    }
    public getPeriodName(): string {
        return this.periodName;
    }
    public getStartTime(): string {
        return this.startTime;
    }
    public getEndTime(): string {
        return this.endTime;
    }
    public getSubject(): string {
        return this.subject;
    }
    public getOriginalStartTime(): string | undefined {
        return this.originalStartTime;
    }
    public getOriginalEndTime(): string | undefined {
        return this.originalEndTime;
    }

    public setId(id: number): void {
        this.id = id;
    }
    public setPeriodName(periodName: string): void {
        this.periodName = periodName;
    }
    public setStartTime(startTime: string): void {
        this.startTime = startTime;
    }
    public setEndTime(endTime: string): void {
        this.endTime = endTime;
    }
    public setSubject(subject: string): void {
        this.subject = subject;
    }
    public setOriginalStartTime(originalStartTime: string | undefined): void {
        this.originalStartTime = originalStartTime;
    }
    public setOriginalEndTime(originalEndTime: string | undefined): void {
        this.originalEndTime = originalEndTime;
    }
}
