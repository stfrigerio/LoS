import { makeRedirectUri, exchangeCodeAsync, refreshAsync, TokenResponse, useAuthRequest } from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { databaseManagers } from '@los/mobile/src/database/tables';
import { useState, useEffect } from 'react';
import Constants from 'expo-constants';

const discovery = {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const SPOTIFY_TOKEN_KEY = 'spotify_token';
const SPOTIFY_REFRESH_TOKEN_KEY = 'spotify_refresh_token';
const SPOTIFY_EXPIRATION_KEY = 'spotify_token_expiration';

export const useSpotifyAuth = () => {
    const [clientId, setClientId] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const fetchCredentials = async () => {
            const clientIdSetting = await databaseManagers.userSettings.getByKey('spotifyClientId');
            const clientSecretSetting = await databaseManagers.userSettings.getByKey('spotifyClientSecret');
            setClientId(clientIdSetting?.value || null);
            setClientSecret(clientSecretSetting?.value || null);
        };

        fetchCredentials();
        loadTokenFromStorage();
    }, []);

    const redirectUri = makeRedirectUri({
        scheme: 'los',
        path: 'spotify-auth-callback'
    });

    const expoGoRedirectUri = makeRedirectUri({
        scheme: 'los'
    });

    const loadTokenFromStorage = async () => {
        const storedToken = await SecureStore.getItemAsync(SPOTIFY_TOKEN_KEY);
        const expirationTime = await SecureStore.getItemAsync(SPOTIFY_EXPIRATION_KEY);
        
        if (storedToken && expirationTime) {
            if (new Date().getTime() < parseInt(expirationTime)) {
                setToken(storedToken);
            } else {
                // Token expired, try to refresh
                await refreshToken();
            }
        }
    };

    const saveTokenToStorage = async (tokenResponse: TokenResponse) => {
        await SecureStore.setItemAsync(SPOTIFY_TOKEN_KEY, tokenResponse.accessToken);
        if (tokenResponse.refreshToken) {
            await SecureStore.setItemAsync(SPOTIFY_REFRESH_TOKEN_KEY, tokenResponse.refreshToken);
        }
        
        // Set expiration time to 1 hour from now if expiresIn is not provided
        const expirationTime = new Date().getTime() + (tokenResponse.expiresIn || 3600) * 1000;
        await SecureStore.setItemAsync(SPOTIFY_EXPIRATION_KEY, expirationTime.toString());
        setToken(tokenResponse.accessToken);
    };

    const refreshToken = async () => {
        const refreshToken = await SecureStore.getItemAsync(SPOTIFY_REFRESH_TOKEN_KEY);
        if (refreshToken && clientId) {
            try {
                const tokenResponse = await refreshAsync(
                    {
                        clientId,
                        clientSecret: clientSecret || undefined,
                        refreshToken,
                    },
                    discovery
                );
                await saveTokenToStorage(tokenResponse);
            } catch (error) {
                console.error('Error refreshing token:', error);
                // If refresh fails, we'll need to re-authenticate
                setToken(null);
            }
        }
    };

    const getAccessToken = async (): Promise<string | null> => {
        if (token) {
            return token;
        }

        // If we don't have a token, we need to authenticate
        try {
            const result = await wrappedPromptAsync();
            if (result?.type === 'success') {
                const { code } = result.params;
                const tokenResult = await exchangeCodeForToken(code);
                await saveTokenToStorage(tokenResult);
                return tokenResult.accessToken;
            }
        } catch (error) {
            console.error('Error during authentication:', error);
        }
        return null;
    };

    const [request, response, promptAsync] = useAuthRequest(
        {
            clientId: clientId || '',
            scopes: ['user-read-email', 'playlist-modify-public'],
            usePKCE: false,
            redirectUri: Constants.appOwnership === 'expo' ? expoGoRedirectUri : redirectUri,
        },
        discovery
    );

    const wrappedPromptAsync = async () => {
        try {
            const result = await promptAsync();
            return result;
        } catch (error) {
            console.error('Error during authentication:', error);
            throw error;
        }
    };

    const exchangeCodeForToken = async (code: string) => {
        if (!clientId || !clientSecret) {
            throw new Error('Spotify credentials not found');
        }
    
        console.log('Redirect URI:', Constants.appOwnership === 'expo' ? expoGoRedirectUri : redirectUri);
    
        try {
            const result = await exchangeCodeAsync(
                {
                    code,
                    clientId,
                    clientSecret,
                    redirectUri: Constants.appOwnership === 'expo' ? expoGoRedirectUri : redirectUri,
                },
                discovery
            );
            return result;
        } catch (error) {
            console.error('Error in exchangeCodeForToken:', error);
            throw error;
        }
    };

    return {
        getAccessToken,
        request,
        response,
        promptAsync: clientId ? wrappedPromptAsync : () => Promise.reject('Spotify Client ID not set'),
        exchangeCodeForToken,
    };
};