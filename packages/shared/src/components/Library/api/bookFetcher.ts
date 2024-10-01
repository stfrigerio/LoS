import { Alert } from 'react-native';
import { databaseManagers } from '@los/mobile/src/database/tables';

// Interface for search results
export interface SearchResult {
    id: string;
    title: string;
    authors: string[];
    publishedDate: string;
    mediaImage: string;
}

// Interface for detailed book information
export interface DetailedBook {
    title: string;
    authors: string[];
    publishedDate: string;
    description: string;
    pageCount: number;
    categories: string[];
    ISBN_13: number; // Extracted ISBN_13 identifier
    mediaImage: string;
    pages: number;
    plot: string;
}

// Interface for industry identifiers
interface IndustryIdentifier {
    type: string;
    identifier: string;
}

// Interface for volume information
interface VolumeInfo {
    title: string;
    authors: string[];
    publishedDate: string;
    description: string;
    pageCount: number;
    categories: string[];
    imageLinks: { thumbnail: string };
    industryIdentifiers: IndustryIdentifier[];
}

// Interface for API response
interface APIResponse {
    items: Array<{
        id: string;
        volumeInfo: VolumeInfo;
    }>;
}


// Update the constants and module.exports
const API_URL = "https://www.googleapis.com/books/v1/volumes";
let API_KEY = "";

async function initializeApiKey() {
    const setting = await databaseManagers.userSettings.getByKey('booksApiKey');
    API_KEY = setting?.value || "";
}

initializeApiKey();

// Main search function
export async function searchBooks(query: string, author?: string): Promise<SearchResult[]> {
    if (!query) {
        Alert.alert("Error", "No query entered.");
        return [];
    }

    if (author) {
        query = `${query}+inauthor:${author}`;
    }

    let finalURL = new URL(API_URL);
    finalURL.searchParams.append("q", query);
    finalURL.searchParams.append("key", API_KEY);

    try {
        const response = await fetch(finalURL.href);
        const data: APIResponse = await response.json();

        return data.items.map(item => ({
            id: item.id,
            title: item.volumeInfo.title,
            authors: item.volumeInfo.authors,
            publishedDate: item.volumeInfo.publishedDate,
            mediaImage: item.volumeInfo.imageLinks?.thumbnail || '' // Store only the thumbnail URL
        }));
    } catch (error) {
        console.error("API Request Failed:", error);
        Alert.alert("Error", "Failed to fetch data");
        return [];
    }
}

// Function to get details of a specific book
export async function getBookDetails(bookId: string): Promise<DetailedBook | null> {
    let finalURL = new URL(`${API_URL}/${bookId}`);
    finalURL.searchParams.append("key", API_KEY);

    try {
        const response = await fetch(finalURL.href);
        const data = await response.json();

        if (data.volumeInfo) {
            const volumeInfo = data.volumeInfo;
            const ISBN_13 = volumeInfo.industryIdentifiers?.find((identifier: IndustryIdentifier) => identifier.type === "ISBN_13")?.identifier || '';

            return {
                title: volumeInfo.title,
                authors: volumeInfo.authors,
                publishedDate: volumeInfo.publishedDate,
                description: volumeInfo.description,
                pageCount: volumeInfo.pageCount,
                categories: volumeInfo.categories || [],
                ISBN_13: ISBN_13,
                mediaImage: volumeInfo.imageLinks?.thumbnail || '', // Corrected to use thumbnail URL
                pages: volumeInfo.pageCount,
                plot: volumeInfo.description
            };
        }

        return null;
    } catch (error) {
        console.error("API Request Failed:", error);
        Alert.alert("Error", "Failed to fetch book details");
        return null;
    }
}