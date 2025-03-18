import { RoomType } from "./room-type";

export class Room {
    private id: number;
    private name: string;
    private type: RoomType;
    private building: string;
    private floor: number;
    private capacity: number;
    private status: number;
    private accessible: boolean;

    constructor(id: number, name: string, type: RoomType, building: string, floor: number, capacity: number, status: number, accessible: boolean) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.building = building;
        this.floor = floor;
        this.capacity = capacity;
        this.status = status;
        this.accessible = accessible;
    }

    public getId(): number {
        return this.id;
    }
    public getName(): string {
        return this.name;
    }
    public getType(): RoomType {
        return this.type;
    }
    public getBuilding(): string {
        return this.building;
    }
    public getFloor(): number {
        return this.floor;
    }
    public getCapacity(): number {
        return this.capacity;
    }
    public getStatus(): number {
        return this.status;
    }
    public isAccessible(): boolean {
        return this.accessible;
    }

    public setId(id: number): void {
        this.id = id;
    }
    public setName(name: string): void {
        this.name = name;
    }
    public setType(type: RoomType): void {
        this.type = type;
    }
    public setBuilding(building: string): void {
        this.building = building;
    }
    public setFloor(floor: number): void {
        this.floor = floor;
    }
    public setCapacity(capacity: number): void {
        this.capacity = capacity;
    }
    public setStatus(status: number): void {
        this.status = status;
    }
    public setAccessible(accessible: boolean): void {
        this.accessible = accessible;
    }
}