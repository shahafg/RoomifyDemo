export class Building {
    private id: number;
    private name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    public getId(): number {
        return this.id;
    }
    public getName(): string {
        return this.name;
    }

    public setId(id: number): void {
        this.id = id;
    }
    public setName(name: string): void {
        this.name = name;
    }
}