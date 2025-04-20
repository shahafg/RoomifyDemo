export class Message {
    private id: string;
    private senderId: string;
    private receiverId: string;
    private content: string;
    private timestamp: Date;
    private read: boolean;

    constructor(id: string, senderId: string, receiverId: string, content: string, timestamp: Date, read: boolean) {
        this.id = id;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.timestamp = timestamp;
        this.read = read;
    }

    public getId(): string {
        return this.id;
    }
    public getSenderId(): string {
        return this.senderId;
    }
    public getReceiverId(): string {
        return this.receiverId;
    }
    public getContent(): string {
        return this.content;
    }
    public getTimestamp(): Date {
        return this.timestamp;
    }
    public isRead(): boolean {
        return this.read;
    }

    public setId(id: string): void {
        this.id = id;
    }
    public setSenderId(senderId: string): void {
        this.senderId = senderId;
    }
    public setReceiverId(receiverId: string): void {
        this.receiverId = receiverId;
    }
    public setContent(content: string): void {
        this.content = content;
    }
    public setTimestamp(timestamp: Date): void {
        this.timestamp = timestamp;
    }
    public setRead(read: boolean): void {
        this.read = read;
    }
}
