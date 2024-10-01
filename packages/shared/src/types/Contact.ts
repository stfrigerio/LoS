export interface ContactData {
    id?: number;
    uuid?: string;
    personId: number;
    source?: string;
    type?: string;
    peopleName?: string;
    peopleLastname?: string;
    dateOfContact: string; // ISO 8601 format: "YYYY-MM-DD"
    createdAt?: string; // ISO 8601 format: "YYYY-MM-DDTHH:mm:ss.sssZ"
    updatedAt?: string; // ISO 8601 format: "YYYY-MM-DDTHH:mm:ss.sssZ"
    synced?: boolean;
}