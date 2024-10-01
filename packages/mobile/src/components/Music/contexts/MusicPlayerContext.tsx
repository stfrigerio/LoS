import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';

interface MusicPlayerContextType {
  currentSong: string | null;
  albumName: string | null;
  songs: string[];
  isPlaying: boolean;
  duration: number;
  position: number;
  playSound: (
    albumName: string,
    songName: string,
    albumSongs: string[]
  ) => void;
  pauseSound: () => void;
  resumeSound: () => void;
  playNextSong: () => void;
  playPreviousSong: () => void;
  seekTo: (value: number) => void;
  stopSound: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(
  undefined
);

interface MusicPlayerProviderProps {
  children: ReactNode;
}

export const MusicPlayerProvider: React.FC<MusicPlayerProviderProps> = ({
  children,
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [albumName, setAlbumName] = useState<string | null>(null);
  const [songs, setSongs] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  // Refs to hold the latest state values
  const songsRef = useRef<string[]>([]);
  const albumNameRef = useRef<string | null>(null);
  const currentIndexRef = useRef<number>(0);

  // Ref for playNextSong to avoid circular dependency
  const playNextSongRef = useRef<() => Promise<void>>();

  // Flag to prevent multiple simultaneous loadSound calls
  const isLoadingRef = useRef<boolean>(false);

  // Update refs whenever state changes
  useEffect(() => {
    songsRef.current = songs;
  }, [songs]);

  useEffect(() => {
    albumNameRef.current = albumName;
  }, [albumName]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Define stopSound first
  const stopSound = useCallback(async () => {
    if (sound) {
      await sound.stopAsync().catch((error) =>
        console.error('Error stopping sound:', error)
      );
      await sound.unloadAsync().catch((error) =>
        console.error('Error unloading sound:', error)
      );
    }
    setSound(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
    setCurrentSong(null);
    setAlbumName(null);
    setSongs([]);
    setCurrentIndex(0);
  }, [sound]);

  // Define loadSound next
  const loadSound = useCallback(
    async (albumName: string, songName: string): Promise<void> => {
      try {
        const songUri = `${FileSystem.documentDirectory}Music/${albumName}/${songName}`;
        console.log('Loading song from URI:', songUri);

        const fileInfo = await FileSystem.getInfoAsync(songUri);
        if (!fileInfo.exists) {
          console.error(`File does not exist: ${songUri}`);
          // Introduce a delay to prevent rapid looping
          setTimeout(() => {
            playNextSongRef.current?.();
          }, 1000); // 1-second delay
          return;
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: songUri },
          { shouldPlay: true }
        );

        // Unload the previous sound if it exists
        if (sound) {
          await sound.unloadAsync().catch((error) =>
            console.error('Error unloading previous sound:', error)
          );
        }

        setSound(newSound);
        setIsPlaying(true);
        setCurrentSong(songName);
      } catch (error) {
        console.error('Failed to load sound:', error);
        // Introduce a delay to prevent rapid looping
        setTimeout(() => {
          playNextSongRef.current?.();
        }, 1000); // 1-second delay
      }
    },
    [sound]
  );

  // Define playNextSong
  const playNextSong = useCallback(async () => {
    if (isLoadingRef.current) {
      // Prevent multiple simultaneous loadSound calls
      return;
    }

    if (songsRef.current.length === 0) {
      console.log('No songs in the playlist');
      return;
    }

    const nextIndex = (currentIndexRef.current + 1) % songsRef.current.length;
    const nextSong = songsRef.current[nextIndex];
    setCurrentIndex(nextIndex);
    setCurrentSong(nextSong);

    if (albumNameRef.current) {
      isLoadingRef.current = true;
      await loadSound(albumNameRef.current, nextSong);
      isLoadingRef.current = false;
    } else {
      console.error('Album name is null, cannot load next song');
      stopSound();
    }
  }, [loadSound, stopSound]);

  // Assign playNextSong to ref
  useEffect(() => {
    playNextSongRef.current = playNextSong;
  }, [playNextSong]);

  // Playback status callback setup
  useEffect(() => {
    if (sound) {
      const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
          setDuration(status.durationMillis || 0);
          setPosition(status.positionMillis || 0);
          if (status.didJustFinish && !status.isLooping) {
            playNextSongRef.current?.();
          }
        } else if (status.error) {
          console.error('Playback error:', status.error);
          playNextSongRef.current?.(); // Attempt to play the next song even if there's an error
        }
      };

      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);

      return () => {
        sound.setOnPlaybackStatusUpdate(null);
      };
    }
  }, [sound]);

  const playSoundHandler = useCallback(
    (
      newAlbumName: string,
      songName: string,
      newAlbumSongs: string[]
    ) => {
      const newIndex = newAlbumSongs.indexOf(songName);
      if (newIndex === -1) {
        console.error('Song not found in the album songs list');
        return;
      }

      setCurrentSong(songName);
      setAlbumName(newAlbumName);
      setSongs(newAlbumSongs);
      setCurrentIndex(newIndex);

      loadSound(newAlbumName, songName);
    },
    [loadSound]
  );

  const pauseSound = useCallback(async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  }, [sound]);

  const resumeSound = useCallback(async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  }, [sound]);

  const playPreviousSong = useCallback(async () => {
    if (isLoadingRef.current) {
      return;
    }

    if (currentIndexRef.current === 0) {
      console.log('Already at the first song');
      return;
    }

    const prevIndex = currentIndexRef.current - 1;
    const prevSong = songsRef.current[prevIndex];
    setCurrentIndex(prevIndex);
    setCurrentSong(prevSong);

    if (albumNameRef.current) {
      isLoadingRef.current = true;
      await loadSound(albumNameRef.current, prevSong);
      isLoadingRef.current = false;
    } else {
      console.error('Album name is null, cannot load previous song');
      stopSound();
    }
  }, [loadSound, stopSound]);

  const seekTo = useCallback(
    async (value: number) => {
      if (sound) {
        await sound.setPositionAsync(value);
      }
    },
    [sound]
  );

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      currentSong,
      albumName,
      songs,
      isPlaying,
      duration,
      position,
      playSound: playSoundHandler,
      pauseSound,
      resumeSound,
      playNextSong,
      playPreviousSong,
      seekTo,
      stopSound,
    }),
    [
      currentSong,
      albumName,
      songs,
      isPlaying,
      duration,
      position,
      playSoundHandler,
      pauseSound,
      resumeSound,
      playNextSong,
      playPreviousSong,
      seekTo,
      stopSound,
    ]
  );

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
