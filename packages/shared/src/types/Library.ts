export interface LibraryData {
    id: number;
    uuid?: string;
    title: string;
    seen: string;
    type: 'movie' | 'book' | 'series' | 'videogame' | 'music';
    genre: string;
    creator: string; // Unified field for director/author/developer
    releaseYear: string; // Unified field for releaseDate/year/publishDate
    rating: number;
    comments: string; //todo no logic for this yet
    mediaImage: string; // Unified field for cover, thumbnail, and poster
    // Specific fields for each type
    boxOffice?: string //For movies
    plot?: string// For movies, series and books?
    cast?: string; // For movies and series
    writer?: string; // For movies and series
    metascore?: number; // For movies and series
    ratingImdb?: number; // For movies and series
    tomato?: number; // For movies and series
    runtime?: string; // For movies and series
    awards?: string; // For movies and series
    seasons?: number; // For series
    modes?: string; // For video games
    igdbURL?: string; // For video games
    pages?: number; // For books
    finished: number; // 0 for not finished, 1 for finished
    leftAt?: string; // For books, series and video games
    isMarkedForDownload?: number;
    createdAt?: string;
    updatedAt?: string;
}

export type LibraryQuery = {
    type?: string;
    genre?: string;
    finished?: number;
    search?: string; 
    isMarkedForDownload?: number;
    limit?: number;
    offset?: number;
    sort?: SortOptionType;
};

export interface BasicMediaItem {
    id: number;
    title: string;
    type: 'movie' | 'book' | 'series' | 'videogame';
    genre: string;
    creator: string;
    releaseYear: string;
    rating: number;
    comments: string;
    mediaImage: string;
    finished: number;
}

// Movies
export interface MovieItem extends BasicMediaItem {
    cast?: string;
    writer?: string;
    metascore?: number;
    ratingImdb?: number;
    tomato?: number;
    runtime?: string;
    awards?: string;
    boxOffice?: string;
    type: 'movie';
    finished: 0
}

// Series
export interface SeriesItem extends BasicMediaItem {
    cast?: string;
    writer?: string;
    metascore?: number;
    ratingImdb?: number;
    tomato?: number;
    runtime?: string;
    rated?: string;
    awards?: string;
    seasons?: number;
    type: 'series';
}

export interface TrackData {
    id?: number;
    uuid: string;
    libraryUuid: string;
    trackName: string;
    trackNumber: number;
    durationMs: number;
    popularity?: number;
    previewUrl?: string;
    // Audio Features
    tempo: number;        // BPM
    key: string;         // Musical key (C, C#, etc.)
    mode: string;        // "Major" or "Minor"
    timeSignature: string; // e.g., "4/4"
    // Audio characteristics (0-100)
    danceability: number;
    energy: number;
    speechiness: number;
    acousticness: number;
    instrumentalness: number;
    liveness: number;
    valence: number;
    playCount: number;
    rating: number;
    createdAt: string;
    updatedAt: string;
}

export type SortOptionType = 'rating' | 'year' | 'seen';
