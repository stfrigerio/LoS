import React, { useState, useEffect } from 'react';
import { useDrawerStatus } from '@react-navigation/drawer';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

import TimerDisplay from './TimerDisplay';
import TagModal from '@los/shared/src/components/modals/TagModal';
import DescriptionModal from '@los/shared/src/components/modals/DescriptionModal';

import { useTimer } from '../helpers/useTimer';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { TagData } from '@los/shared/src/types/TagsAndDescriptions';

export interface SelectionData {
  isTagModalOpen: boolean;
  isDescriptionModalOpen: boolean;
  selectedTag?: TagData;
  selectedDescription?: TagData;
  newTagName?: string;
  newDescriptionName?: string;
}

interface TimerComponentProps {
  homepageSettings?: any;
}

const TimerComponent: React.FC<TimerComponentProps> = ({ homepageSettings }) => {
  const [selectionData, setSelectionData] = useState<SelectionData>({
    isTagModalOpen: false,
    isDescriptionModalOpen: false,
  });

  const hideNextObjective = homepageSettings?.HideNextObjective?.value === 'true';

  const { timerRunning, initialSeconds, startTimer, stopTimer, getCurrentTimerSecondsRef, tag, description, fetchActiveTimer, checkAndClearStuckNotification } = useTimer();
  
  const { theme, themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors);

  const handleTagDescriptionSelection = () => {
    if (selectionData.selectedTag && selectionData.selectedDescription) {
      startTimer(selectionData.selectedTag.text, selectionData.selectedDescription.text);
      setSelectionData(prev => ({
        ...prev,
        isTagModalOpen: false,
        isDescriptionModalOpen: false,
      }));
    }
  };

  useEffect(handleTagDescriptionSelection, [selectionData.selectedTag, selectionData.selectedDescription]);

  const handleStopTimer = async () => {
    await stopTimer();
    setSelectionData(prevData => ({
      ...prevData,
      selectedTag: undefined,
      selectedDescription: undefined,
    }));
    checkAndClearStuckNotification()
  };

  return (
    <View style={styles.container}>
      {!timerRunning && (
        <Pressable style={styles.floatingButton} onPress={() => setSelectionData(prev => ({ ...prev, isTagModalOpen: true }))}>
          <FontAwesomeIcon icon={faPlay} size={16} color={'#1E2225'} style={{ marginLeft: 3}}/>
        </Pressable>
      )}
      {timerRunning && (
        <View style={styles.timerContent}>
          <Pressable style={styles.stopButton} onPress={handleStopTimer}>
            <FontAwesomeIcon icon={faPause} size={24} color={themeColors.textColor} />
          </Pressable>
        </View>
      )}
      {timerRunning && (
        <Pressable onPress={fetchActiveTimer} style={
          [
            styles.timerDisplayWrapper,
            {
              height: hideNextObjective ? 80 : 20,
            }
          ]
        }>
          <TimerDisplay
            initialSeconds={initialSeconds}
            tagName={selectionData.selectedTag?.text || tag || ''}
            description={selectionData.selectedDescription?.text || description || ''}
            registerTimer={(timerFunction) => getCurrentTimerSecondsRef.current = timerFunction}
            homepageSettings={homepageSettings}
          />
        </Pressable>
      )}
      <TagModal
        isOpen={selectionData.isTagModalOpen}
        setSelectionData={setSelectionData}
        sourceTable='TimeTable'
      />
      <DescriptionModal
        isOpen={selectionData.isDescriptionModalOpen}
        selectedTag={selectionData.selectedTag}
        setSelectionData={setSelectionData}
        sourceTable='TimeTable'
      />
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  floatingButton: {
    backgroundColor: '#CD535B',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  timerContent: {
    // borderWidth: 1,
    // borderColor: 'green',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopButton: {
    // borderWidth: 1,
    // borderColor: 'blue',
    padding: 15,
    borderRadius: 5,
  },
  timerDisplayWrapper: {
    // borderWidth: 1,
    // borderColor: 'yellow',
    position: 'absolute',
    bottom: -10,
    width: 200,
    left: 55,
  }
});

export default TimerComponent;
