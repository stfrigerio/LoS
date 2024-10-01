export interface PersonData {
    id: string;
    uuid: string;
    name: string;
    middleName?: string;
    lastName: string;
    birthDay?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    pronouns?: string;
    category: string;
    notificationEnabled: string;
    frequencyOfContact?: string;
    occupation?: string;
    partner?: string;
    likes?: string;
    dislikes?: string;
    description?: string;
    aliases?: string;
    country?: string;
    createdAt?: string;
    updatedAt?: string;
    synced: number;
}