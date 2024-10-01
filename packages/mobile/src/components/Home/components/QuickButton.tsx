import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Pressable, Text, Animated, Modal, SafeAreaView, StatusBar, Easing, Platform } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

import TaskModal from '@los/shared/src/components/modals/TaskModal';
import TransactionModal from '@los/shared/src/components/modals/TransactionModal';
import MoodModal from '@los/shared/src/components/modals/MoodModal';
import ContactModal from '@los/shared/src/components/modals/ContactModal';
import Journal from '@los/shared/src/components/Journal/components/Journal';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

interface QuickButtonProps {  
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  homepageSettings: any;
}

let useTaskData
let CarLocationModal: any
if (Platform.OS === 'web') {
    useTaskData = require('@los/desktop/src/components/Tasks/hooks/useTasksData').useTasksData
    // CarLocationModal = require('@los/mobile/src/components/modals/CarLocationModal').CarLocationModal
} else {
    useTaskData = require('@los/mobile/src/components/Tasks/hooks/useTasksData').useTasksData
    CarLocationModal = require('@los/mobile/src/components/modals/CarLocationModal').default
}

const QuickButton: React.FC<QuickButtonProps> = ({ isExpanded, setIsExpanded, homepageSettings }) => {
  const { theme, themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isCarLocationModalOpen, setIsCarLocationModalOpen] = useState(false);

  const { addTask, updateTask } = useTaskData();

  const buttonConfig = [
    { key: 'contact', settingKey: 'HidePeople' },
    { key: 'journal', settingKey: 'HideJournal' },
    { key: 'mood', settingKey: 'HideMoods' },
    { key: 'task', settingKey: 'HideTasks' },
    { key: 'transaction', settingKey: 'HideMoney' },
    { key: 'carLocation', settingKey: 'HideCarLocation' },
  ];

  const visibleButtons = buttonConfig.filter(
    ({ settingKey }) => homepageSettings[settingKey]?.value === "false"
  );

  const fadeAnims = useRef({
    transaction: new Animated.Value(0),
    mood: new Animated.Value(0),
    task: new Animated.Value(0),
    people: new Animated.Value(0),
    contact: new Animated.Value(0),
    journal: new Animated.Value(0),
    carLocation: new Animated.Value(0),
  }).current;

  const elevationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animations = visibleButtons.map((button, index) => {
      const reverseIndex = visibleButtons.length - 1 - index;
      return Animated.timing(fadeAnims[button.key as keyof typeof fadeAnims], {
        toValue: isExpanded ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
        delay: isExpanded ? reverseIndex * 80 : index * 80,
      });
    });

    const elevationAnimation = Animated.timing(elevationAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 100,
      useNativeDriver: false,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Custom easing for smoother transition
    });

    if (isExpanded) {
      setButtonsVisible(true);
      Animated.parallel([...animations, elevationAnimation]).start();
    } else {
      Animated.parallel([...animations, elevationAnimation]).start(({ finished }) => {
        if (finished) {
          setButtonsVisible(false);
        }
      });
    }
  }, [isExpanded]);

  const animatedElevation = elevationAnim.interpolate({
    inputRange: [0, 0.8, 0.9, 1],
    outputRange: [0, 0, 10, 10],
    extrapolate: 'clamp'
  });

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);


  const handleNewJournal = () => {
    setIsJournalModalOpen(true);
    setIsExpanded(false); // Close the quick button menu
  };

  const getButtonText = (key: string) => {
    switch (key) {
      case 'journal': return '📝 Journal';
      case 'contact': return '🗣️ Contact';
      case 'task': return '✅ Task';
      case 'mood': return '💭 Mood';
      case 'transaction': return '💸 Transaction';
      case 'carLocation': return '🚗 Car Location';
      default: return '';
    }
  };
  
  const handleButtonPress = (key: string) => {
    switch (key) {
      case 'journal': handleNewJournal(); break;
      case 'contact': setIsContactModalOpen(true); break;
      case 'task': setIsAddModalOpen(true); break;
      case 'mood': setIsMoodModalOpen(true); break;
      case 'transaction': setIsTransactionModalOpen(true); break;
      case 'carLocation': setIsCarLocationModalOpen(true); break;
    }
  };

  return (
    <View style={styles.container}>
      {buttonsVisible && (
        <View style={[styles.buttonContainer]}>
          {visibleButtons.map(({ key }) => (
            <Animated.View 
              key={key}
              style={{ 
                opacity: fadeAnims[key as keyof typeof fadeAnims],
              }}
            >
              <AnimatedPressable 
                style={[
                  styles.secondaryButton,
                  { elevation: animatedElevation as any } // Type assertion to avoid TS error
                ]}
                onPress={() => handleButtonPress(key)}
              >
                <Text style={styles.buttonText}>{getButtonText(key)}</Text>
              </AnimatedPressable>
            </Animated.View>
          ))}
        </View>
      )}
      <Pressable
        style={[styles.floatingButton, { width: 56 }]}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <FontAwesomeIcon icon={isExpanded ? faMinus : faPlus} size={24} color="#1E2225" />
      </Pressable>

      {isJournalModalOpen &&
        <Modal
          visible={isJournalModalOpen}
          animationType="slide"
          onRequestClose={() => setIsJournalModalOpen(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <StatusBar backgroundColor={themeColors.backgroundColor} barStyle="dark-content" />
            <Journal
              date={new Date().toISOString()}
              uuid=""
              onClose={() => setIsJournalModalOpen(false)}
            />
          </SafeAreaView>
        </Modal>
      }
      {isAddModalOpen &&
        <TaskModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddItem={addTask}
          onUpdateItem={updateTask}
        />
      }
      {isContactModalOpen &&
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
      }
      {isMoodModalOpen &&
        <MoodModal
          isOpen={isMoodModalOpen}
          closeMoodModal={() => setIsMoodModalOpen(false)}
        />
      }
      {isTransactionModalOpen &&
        <TransactionModal
          isOpen={isTransactionModalOpen}
          closeTransactionModal={() => setIsTransactionModalOpen(false)}
        />
      }
      {isCarLocationModalOpen &&
        <CarLocationModal
          isOpen={isCarLocationModalOpen}
          onClose={() => setIsCarLocationModalOpen(false)}
        />
      }
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    zIndex: 2
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  secondaryButton: {
    backgroundColor: 'rgba(227, 142, 148, 0.9)',
    marginBottom: 16,
    width: 150,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',  
  },
  buttonText: {
    color: '#1E2225',
    fontSize: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 70,
    right: 0,
    alignItems: 'flex-end',
  },
  mainButtonText: {
    color: '#1E2225',
    fontSize: 16,
    marginBottom: 3
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
    marginTop: -40,
  },
});

export default QuickButton;
