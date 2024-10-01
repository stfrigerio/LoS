import { LibraryData, SortOptionType } from "../../../types/Library";

export const PAGE_SIZE = 10; // Define how many items you want per page

export const sortOptions: Record<SortOptionType, (a: LibraryData, b: LibraryData) => number> = {
    year: (a, b) => {
        const yearA = typeof a.releaseYear === 'number' ? a.releaseYear : Date.parse(a.releaseYear);
        const yearB = typeof b.releaseYear === 'number' ? b.releaseYear : Date.parse(b.releaseYear);
        return yearB - yearA;
    },
    rating: (a, b) => b.rating - a.rating,
    seen: (a, b) => {
        // Assuming 'seen' is a date or a string that represents a date
        const seenA = Date.parse(a.seen);
        const seenB = Date.parse(b.seen);
        return seenB - seenA;
    }
};