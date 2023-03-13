
export enum Roles {
    user = "user",
    system = "system",
    assistant = "assistant"
}
export class ConversationDto {
    role!: Roles;
    content!: string;
}