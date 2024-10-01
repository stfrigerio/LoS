import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { formatSecondsToHMS } from '@los/shared/src/utilities/timeUtils';
import { databaseManagers } from '../../../database/tables';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

interface TimerDisplayProps {
    initialSeconds: number;
    tagName?: string;
    description?: string;
    registerTimer: (timerFunction: () => number) => void;
    homepageSettings: any;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ initialSeconds, tagName, description, registerTimer, homepageSettings }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const secondsRef = useRef(initialSeconds);
  const [emoji, setEmoji] = useState<string>('');
  const [descriptionEmoji, setDescriptionEmoji] = useState<string>('');

  const { theme, themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors);

  useEffect(() => {
    setSeconds(initialSeconds); // Reset seconds state when initialSeconds changes
    secondsRef.current = initialSeconds; // Update the ref to the new initial value

    const intervalId = setInterval(() => {
        setSeconds(prevSeconds => {
            const newSeconds = prevSeconds + 1;
            secondsRef.current = newSeconds;
            return newSeconds;
        });
    }, 1000);

    registerTimer(() => secondsRef.current);

    return () => {
        clearInterval(intervalId);
        registerTimer(() => 0);
    };
  }, [initialSeconds, registerTimer]);

  useEffect(() => {
    const fetchEmojis = async () => {
      const emojiMapping: { [key: string]: string } = {};

      const defaultTags = await databaseManagers.tags.getTagsByType('timeTag');
      defaultTags.forEach(tag => {
        emojiMapping[tag.text] = tag.emoji;
      });
      const defaultDescription = await databaseManagers.tags.getTagsByType('timeDescription');
      defaultDescription.forEach(desc => {
        emojiMapping[desc.text] = desc.emoji;
      });

      const tagEmoji = emojiMapping[tagName || ''] || '';
      const descEmoji = emojiMapping[description || ''] || tagEmoji;
      setEmoji(tagEmoji);
      setDescriptionEmoji(descEmoji);
    };

    fetchEmojis();
  }, [tagName, description]);

  const hideNextObjective = homepageSettings?.HideNextObjective?.value === 'true';

  return (
    <View style={[
      styles.timerFlexContainer,
      {
        left: 0,
        right: 0,
        bottom: 0,
      }
    ]}>
      <View style={[
        styles.timerContentWrapper, 
        { 
          flexDirection: hideNextObjective ? 'column' : 'row', 
          gap: hideNextObjective ? 4 : 0,
        }
      ]}>
        <View style={styles.tagContainer}>
          <Text style={[styles.timerTag, { fontSize: hideNextObjective ? 12 : 10 }]} numberOfLines={1} ellipsizeMode="tail">
            {emoji} {tagName}
          </Text>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={[styles.timerDescription, { fontSize: hideNextObjective ? 12 : 10 }]} numberOfLines={1} ellipsizeMode="tail">
            {descriptionEmoji} {description}
          </Text>
        </View>
        <Text style={[styles.timer, { fontSize: hideNextObjective ? 12 : 10 }]}>{formatSecondsToHMS(seconds)}</Text>
      </View>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  timerFlexContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 4,
    paddingHorizontal: 8,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  timerContentWrapper: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagContainer: {
    flex: 3.4,
    marginRight: 2,
  },
  descriptionContainer: {
    flex: 3,
    marginRight: 2,
  },
  timerTag: {
    fontWeight: 'bold',
    color: theme.textColor,
    fontSize: 10,
  },
  timerDescription: {
    fontSize: 10,
    color: theme.textColor,
    opacity: 0.8,
  },
  timer: {
    color: theme.textColor,
    fontWeight: 'bold',
    fontSize: 11,
    minWidth: 30,
    textAlign: 'right',
  },
});

export default TimerDisplay;
