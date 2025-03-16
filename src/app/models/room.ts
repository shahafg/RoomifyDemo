export class Room {
    private id: number;
    private name: string;
    private building: string;
    private floor: number;
    private capacity: number;
    private status: number;
    private accessible: boolean;

    constructor(id: number, name: string, building: string, floor: number, capacity: number, status: number, accessible: boolean) {
        this.id = id;
        this.name = name;
        this.building = building;
        this.floor = floor;
        this.capacity = capacity;
        this.status = status;
        this.accessible = accessible;
    }

        public getId(): number {
            return this.id;
        }
        public setId(id: number): void {
            this.id = id;
        }
        public getName(): string {
            return this.name;
        }
        public setName(name: string): void {
            this.name = name;
        }
        public getBuilding(): string {
            return this.building;
        }
        public setBuilding(building: string): void {
            this.building = building;
        }
        public getFloor(): number {
            return this.floor;
        }
        public setFloor(floor: number): void {
            this.floor = floor;
        }
        public getCapacity(): number {
            return this.capacity;
        }
        public setCapacity(capacity: number): void {
            this.capacity = capacity;
        }
            public getStatus(): number {
            return this.status;
        }
        public setStatus(status: number): void {
            this.status = status;
        }
        public isAccessible(): boolean {
            return this.accessible;
        }
        public setAccessible(accessible: boolean): void {
            this.accessible = accessible;
        }
}