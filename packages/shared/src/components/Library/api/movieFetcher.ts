import { Alert } from 'react-native';
import { databaseManagers } from '@los/mobile/src/database/tables';

import { MovieItem } from '../../../types/Library';

const API_URL = "https://www.omdbapi.com/";
let API_KEY = "";

async function initializeApiKey() {
    const setting = await databaseManagers.userSettings.getByKey('moviesApiKey');
    API_KEY = setting?.value || "";
}

initializeApiKey();

export interface Movie extends MovieItem {
    Director: string;
    Genre: string;
    imdbID: string; // Corrected casing
    Title: string;
    Year: string;
    Poster: string;
    BoxOffice: string;
    Plot: string;
    Metascore: number;
    imdbRating: number;
    Awards: string;
    Actors: string;
    Writer: string;
    Ratings: Rating[]; // Added Ratings array
    Runtime: string,
}

interface Rating {
    Source: string;
    Value: string;
}

interface OmdbSearchResult {
    Search: Movie[];
    totalResults: string;
    Response: string;
}

export async function fetchMovies(query: string): Promise<Movie[]> {
    try {
        const searchResults = await apiGet({ s: query });
        if (!searchResults || !searchResults.Search || !searchResults.Search.length) {
            Alert.alert("No results found.");
            return [];
        }

        const mappedResults = searchResults.Search.map((result: Movie) => {
            const tomatoRating = result.Ratings?.find((rating: Rating) => rating.Source === "Rotten Tomatoes");
            
            return {
                ...result,
                tomato: tomatoRating ? parseInt(tomatoRating.Value) : null,
            }
        });

        return mappedResults;

    } catch (error) {
        console.error("Error fetching movies:", error);
        Alert.alert("Error fetching data");
        return [];
    }
}

export function isImdbId(str: string): boolean {
    return /^tt\d+$/.test(str);
}

export async function getByImdbId(id: string): Promise<Movie | null> {
    const res = await apiGet({ i: id });
    if (!res) {
        Alert.alert("No results found.");
        return null;
    }
    
    const tomatoRating = res.Ratings.find((rating: Rating) => rating.Source === "Rotten Tomatoes");

    return {
        ...res,
        id: res.imdbID,
        title: res.Title,
        type: 'movie',
        genre: res.Genre,
        creator: res.Director,
        releaseYear: res.Year,
        mediaImage: res.Poster,
        boxOffice: res.BoxOffice,
        plot: res.Plot,
        cast: res.Actors,
        writer: res.Writer,
        metascore: res.Metascore,
        ratingImdb: res.imdbRating,
        tomato: tomatoRating ? parseInt(tomatoRating.Value) : null,
        runtime: res.Runtime,
        awards: res.Awards,
    };
}

async function apiGet(params: Record<string, string | undefined>): Promise<OmdbSearchResult | any> {
    let finalURL = new URL(API_URL);
    Object.keys(params).forEach((key) => finalURL.searchParams.append(key, params[key] || ""));
    finalURL.searchParams.append("apikey", API_KEY);

    try {
        const response = await fetch(finalURL.href);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("API Request Failed:", error);
        Alert.alert("Failed to fetch data");
        return null;
    }
}
