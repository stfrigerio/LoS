import { compareTwoStrings } from 'string-similarity';
import { databaseManagers } from '@los/mobile/src/database/tables';
import { TrackData } from '@los/shared/src/types/Library';

interface AutoLinkOptions {
    similarityThreshold?: number;
    ignoreTrackNumbers?: boolean;
    ignoreCase?: boolean;
}

const defaultOptions: AutoLinkOptions = {
    similarityThreshold: 0.8,
    ignoreTrackNumbers: true,
    ignoreCase: true,
};

const cleanString = (str: string, options: AutoLinkOptions): string => {
    if (!str) {
        console.error('Empty string received in cleanString');
        return '';
    }
    
    let cleaned = str;
    
    // Remove file extension
    if (cleaned.includes('.')) {
        cleaned = cleaned.split('.').slice(0, -1).join('.');
    }
    
    // Remove track numbers if enabled
    if (options.ignoreTrackNumbers) {
        const beforeNumberRemoval = cleaned;
        cleaned = cleaned.replace(/^(\d+[\s.-])+/, '');
    }
    
    // Convert to lowercase if enabled
    if (options.ignoreCase) {
        cleaned = cleaned.toLowerCase();
    }
    
    const result = cleaned.trim();
    return result;
};
const findBestMatch = (
    trackName: string, 
    filenames: string[], 
    options: AutoLinkOptions
): string | null => {
    
    let bestMatch = null;
    let bestScore = 0;
    
    const cleanTrackName = cleanString(trackName, options);
    console.log('Cleaned track name:', cleanTrackName);
    
    for (const filename of filenames) {
        const cleanFilename = cleanString(filename, options);
        
        const score = compareTwoStrings(cleanFilename, cleanTrackName);
        
        if (score > (options.similarityThreshold || 0.8) && score > bestScore) {
            bestScore = score;
            bestMatch = filename;
            console.log('New best match found! Score:', score);
        }
    }
    
    return bestMatch;
};

export const autoLinkTracks = async (
    albumUuid: string,
    albumSongs: string[],
    options: AutoLinkOptions = defaultOptions
): Promise<{ 
    success: boolean; 
    linkedCount: number; 
    errors?: string[];
}> => {
    try {
        // Get all tracks for this album
        const tracks = await databaseManagers.music.getMusicTracks({ 
            libraryUuid: albumUuid 
        });
        
        const unlinkedTracks = tracks.filter(track => !track.fileName);
        
        const errors: string[] = [];
        let linkedCount = 0;
        
        for (const track of unlinkedTracks) {
            const bestMatch = findBestMatch(track.trackName, albumSongs, options);
            
            if (bestMatch) {
                try {
                    const updatedTrack = {
                        ...track,
                        fileName: bestMatch,
                        updatedAt: new Date().toISOString()
                    };
                    
                    await databaseManagers.music.upsert(updatedTrack);
                    linkedCount++;
                } catch (error) {
                    console.error('Error linking track:', error);
                    errors.push(`Failed to link "${track.trackName}": ${error}`);
                }
            } else {
                console.log('No match found above threshold');
            }
        }
        
        return {
            success: true,
            linkedCount,
            errors: errors.length > 0 ? errors : undefined
        };
    } catch (error) {
        console.error('Fatal error during auto-link:', error);
        return {
            success: false,
            linkedCount: 0,
            errors: [`Failed to auto-link tracks: ${error}`]
        };
    }
};