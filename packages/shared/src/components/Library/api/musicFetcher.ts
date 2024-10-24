import { Alert } from 'react-native';

import { useSpotifyAuth } from './spotifyAuth';

import { LibraryData } from '../../../types/Library';

const API_URL = "https://api.spotify.com/v1/";

export interface Album {
    id: string;
    name: string;
    artists: { name: string }[];
    release_date: string;
    total_tracks: number;
    images: { url: string }[];
    genres: string[];
}

interface AudioFeatures {
    danceability: number;
    energy: number;
    key: number;
    loudness: number;
    mode: number;
    speechiness: number;
    acousticness: number;
    instrumentalness: number;
    liveness: number;
    valence: number;
    tempo: number;  // BPM
    time_signature: number;
}

export const useSpotifyFetcher = () => {
    const { getAccessToken } = useSpotifyAuth();

    const fetchAlbums = async (query: string): Promise<Album[]> => {
        try {
            const token = await getAccessToken();
            if (!token) {
                console.log('No token available');
                return [];
            }

            const searchResults = await apiGet('search', { q: query, type: 'album' }, token);
            if (!searchResults || !searchResults.albums || !searchResults.albums.items.length) {
                Alert.alert("No results found", "Try a different search term.");
                return [];
            }

            return searchResults.albums.items;
        } catch (error) {
            console.error("Error fetching albums:", error);
            Alert.alert("Error", "Failed to fetch albums. Please try again.");
            return [];
        }
    };

    const getAlbumById = async (id: string): Promise<LibraryData | null> => {
        try {
            const token = await getAccessToken();
            if (!token) {
                console.log('No token available');
                return null;
            }
    
            const albumRes = await apiGet(`albums/${id}`, {}, token);
            if (!albumRes) {
                Alert.alert("No results found", "Album not found.");
                return null;
            }

            const trackNames = albumRes.tracks?.items.map((track: { name: string }) => track.name).join(' | ');
    
            // Fetch the first artist's details
            const artistId = albumRes.artists[0]?.id;
            let genres: string[] = [];
            if (artistId) {
                const artistRes = await apiGet(`artists/${artistId}`, {}, token);
                if (artistRes && artistRes.genres) {
                    genres = artistRes.genres;
                }
            }
    
            //@ts-ignore we dont wanna save the id here as its a string
            return {
                // id: albumRes.id,
                seen: new Date().toISOString(),
                title: albumRes.name,
                type: 'music',
                genre: genres.join(', '), // Join all genres into a single string
                creator: albumRes.artists.map((artist: { name: string }) => artist.name).join(', '),
                releaseYear: new Date(albumRes.release_date).getFullYear().toString(),
                rating: 0, 
                comments: '',
                mediaImage: albumRes.images[0]?.url || '',
                finished: 1,
                cast: trackNames,
            };
        } catch (error) {
            console.error("Error fetching album:", error);
            Alert.alert("Error", "Failed to fetch album details. Please try again.");
            return null;
        }
    };

    const apiGet = async (endpoint: string, params: Record<string, string>, token: string): Promise<any> => {
        let finalURL = new URL(API_URL + endpoint);
        Object.keys(params).forEach(key => finalURL.searchParams.append(key, params[key]));
        try {
            const response = await fetch(finalURL.href, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("API Request Failed:", error);
            return null;
        }
    };

    const getTrackDetails = async (trackId: string) => {
        try {
            const token = await getAccessToken();
            if (!token) {
                console.log('No token available');
                return null;
            }

            const trackRes = await apiGet(`tracks/${trackId}`, {}, token);
            if (!trackRes) {
                console.log("Track not found");
                return null;
            }

            // Fetch audio features (includes BPM, key, etc.)
            const audioFeatures = await apiGet(`audio-features/${trackId}`, {}, token);

            // Map musical key numbers to actual keys
            const keyMap: { [key: number]: string } = {
                0: "C",
                1: "C♯/D♭",
                2: "D",
                3: "D♯/E♭",
                4: "E",
                5: "F",
                6: "F♯/G♭",
                7: "G",
                8: "G♯/A♭",
                9: "A",
                10: "A♯/B♭",
                11: "B"
            };

            // Return comprehensive track data
            return {
                // Basic track info
                id: trackRes.id,
                name: trackRes.name,
                duration_ms: trackRes.duration_ms,
                popularity: trackRes.popularity,
                previewUrl: trackRes.preview_url,
                trackNumber: trackRes.track_number,
                
                // Audio features
                audioFeatures: audioFeatures ? {
                    tempo: Math.round(audioFeatures.tempo), // BPM
                    key: keyMap[audioFeatures.key],
                    mode: audioFeatures.mode === 1 ? "Major" : "Minor",
                    timeSignature: `${audioFeatures.time_signature}/4`,
                    danceability: Math.round(audioFeatures.danceability * 100),
                    energy: Math.round(audioFeatures.energy * 100),
                    speechiness: Math.round(audioFeatures.speechiness * 100),
                    acousticness: Math.round(audioFeatures.acousticness * 100),
                    instrumentalness: Math.round(audioFeatures.instrumentalness * 100),
                    liveness: Math.round(audioFeatures.liveness * 100),
                    valence: Math.round(audioFeatures.valence * 100), // Musical positiveness
                } : null,
            };
        } catch (error) {
            console.error("Error fetching track:", error);
            return null;
        }
    };

    return {
        fetchAlbums,
        getAlbumById,
        getTrackDetails,
        apiGet,
        getAccessToken
    };
};