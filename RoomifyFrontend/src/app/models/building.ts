export class Building {
    private id: number;
    private name: string;
    private description: string;
    private floors: number;

    constructor(id: number, name: string, description: string, floors: number) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.floors = floors;
    }

    public getId(): number {
        return this.id;
    }
    public getName(): string {
        return this.name;
    }
    public getDescription(): string {
        return this.description;
    }
    public getFloors(): number {
        return this.floors;
    }

    public setId(id: number): void {
        this.id = id;
    }
    public setName(name: string): void {
        this.name = name;
    }
    public setDescription(description: string): void {
        this.description = description;
    }
    public setFloors(floors: number): void {
        this.floors = floors;
    }
}