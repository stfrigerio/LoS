import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { format } from 'date-fns';

import { UniversalModal } from '@los/shared/src/sharedComponents/UniversalModal';
import AlertModal from '@los/shared/src/components/modals/AlertModal';
import createTimePicker from '@los/shared/src/sharedComponents/DateTimePicker';
import { FormInput, PickerInput, SwitchInput } from './components/FormComponents';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { TaskData } from '../../types/Task';
import { PillarData } from '../../types/Pillar';
import { ObjectiveData } from '../../types/Objective';

let useTasksData
if (Platform.OS === 'web') {
  useTasksData = require('@los/desktop/src/components/Tasks/hooks/useTasksData').useTasksData;
} else {
  useTasksData = require('@los/mobile/src/components/Tasks/hooks/useTasksData').useTasksData;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: TaskData) => void;
  onUpdateItem: (item: TaskData) => void;
  task?: TaskData;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onAddItem, onUpdateItem, task }) => {
  const [itemName, setItemName] = useState<string>(task?.text || '');
  const [dateInput, setDateInput] = useState<string>(task?.due || '');
  const [endDateInput, setEndDateInput] = useState<string>(task?.end || '');
  const [noteText, setNoteText] = useState<string>(task?.note || '');
  const [selectedPillarUuid, setSelectedPillarUuid] = useState<string | undefined>(task?.pillarUuid || undefined);
  const [objectiveUuid, setObjectiveUuid] = useState<string | undefined>(task?.objectiveUuid || undefined);
  const [priority, setPriority] = useState<number | undefined>(task?.priority || undefined);
  const [repeat, setRepeat] = useState<string | undefined>(task?.repeat || undefined);
  const [frequency, setFrequency] = useState<string | undefined>(task?.frequency || undefined);

  const [showNote, setShowNote] = useState<boolean>(!!task?.note);
  const [showPriority, setShowPriority] = useState<boolean>(!!task?.priority);
  const [showPillar, setShowPillar] = useState<boolean>(!!task?.pillarUuid);
  const [showFrequency, setShowFrequency] = useState<boolean>(!!task?.frequency);
  const [showObjective, setShowObjective] = useState<boolean>(!!task?.objectiveUuid);

  const { pillars, uncompletedObjectives } = useTasksData();

  const { showPicker, picker } = createTimePicker();
  const [showEndDateTime, setShowEndDateTime] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState(false);

  const { theme, themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors);

  const addNewItem = () => {
    if (itemName) {
      let newTask: TaskData;
      if (task?.uuid) {
        newTask = {
          id: task?.id,
          uuid: task?.uuid,
          text: itemName,
          due: dateInput,
          completed: task?.completed || false,
          repeat: repeat,
          frequency: frequency,
          end: endDateInput,
          note: noteText,
          pillarUuid: selectedPillarUuid,
          objectiveUuid: task?.objectiveUuid,
          priority: priority,
          createdAt: task?.createdAt,
          synced: task?.synced,
          type: task?.type,
        };
        onUpdateItem(newTask);
      } else {
        newTask = {
          text: itemName,
          due: dateInput,
          completed: false,
          end: endDateInput,
          repeat: repeat,
          frequency: frequency,
          note: noteText,
          pillarUuid: selectedPillarUuid,
          objectiveUuid: objectiveUuid,
          priority: priority,
        };
        onAddItem(newTask); 
      }

      setItemName('');
      setDateInput('');
      setEndDateInput('');
      setSelectedPillarUuid(undefined);
      setObjectiveUuid(undefined);
      setPriority(undefined);
      setRepeat(undefined);
      setFrequency(undefined);
      setShowNote(false);
      setShowPriority(false);
      setShowPillar(false);
      setShowFrequency(false);
      setShowObjective(false);
      onClose();
    } else {
      setShowAlert(true);
    }
  };

  const showDateTimePicker = (isStart: boolean, isDate: boolean) => {
    const currentDate = isStart ? new Date(dateInput || Date.now()) : new Date(endDateInput || Date.now());
    
    showPicker({
      mode: isDate ? 'date' : 'time',
      value: currentDate,
      is24Hour: true,
    }, (selectedDate) => {
      if (selectedDate) {
        updateDateTime(selectedDate, isStart, isDate);
      }
    });
  };

  const updateDateTime = (date: Date, isStart: boolean, isDate: boolean) => {
    const updatedDate = isStart ? new Date(dateInput || Date.now()) : new Date(endDateInput || Date.now());
    
    if (isDate) {
      updatedDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    } else {
      updatedDate.setHours(date.getHours(), date.getMinutes());
    }
    
    const formattedDate = format(updatedDate, "yyyy-MM-dd'T'HH:mm:ss");
    
    if (isStart) {
      setDateInput(formattedDate);
    } else {
      setEndDateInput(formattedDate);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setItemName(task?.text || '');
      setDateInput(task?.due || '');
      setEndDateInput(task?.end || '');
    }
  }, [isOpen, task]);

  const pillarItems = [
    { label: 'None', value: '' },
    ...pillars.map((pillar: PillarData) => ({
      label: `${pillar.emoji} ${pillar.name}`,
      value: pillar.uuid
    }))
  ];

  const objectiveItems = [
    { label: 'None', value: '' },
    ...uncompletedObjectives.map((objective: ObjectiveData) => {
      const pillar = pillars.find((p: PillarData) => p.uuid === objective.pillarUuid);
      const emoji = pillar ? pillar.emoji : '';
      return {
        label: `${emoji} ${objective.objective}`,
        value: objective.uuid,
        pillarUuid: objective.pillarUuid
      };
    })
  ];

  const priorityItems = [
    { label: 'None', value: '' },
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
  ];

  const frequencyItems = [
    { label: 'None', value: '' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  const getFrequencyOptions = (selectedFrequency: string) => {
    switch (selectedFrequency) {
      case 'daily':
        return [
          { label: 'Every day', value: 'daily' },
          { label: 'Every weekday', value: 'weekday' },
          { label: 'Every weekend', value: 'weekend' },
        ];
      case 'weekly':
        return [
          { label: 'Every Monday', value: 'weekly_mon' },
          { label: 'Every Tuesday', value: 'weekly_tue' },
          { label: 'Every Wednesday', value: 'weekly_wed' },
          { label: 'Every Thursday', value: 'weekly_thu' },
          { label: 'Every Friday', value: 'weekly_fri' },
          { label: 'Every Saturday', value: 'weekly_sat' },
          { label: 'Every Sunday', value: 'weekly_sun' },
        ];
      case 'monthly':
        return [
          { label: 'On the 1st', value: 'monthly_1' },
          { label: 'On the 15th', value: 'monthly_15' },
          { label: 'On the last day', value: 'monthly_last' },
        ];
      case 'yearly':
        return [
          { label: 'On January 1st', value: 'yearly_0101' },
          { label: 'On July 1st', value: 'yearly_0701' },
          { label: 'On December 31st', value: 'yearly_1231' },
        ];
      default:
        return [];
    }
  };

  const modalContent = (
    <View style={styles.modalContent}>
      {task ? (
        <Text style={[designs.text.title, styles.title]}> ✏️ Edit task </Text>
      ) : (
        <Text style={[designs.text.title, styles.title]}> ✅ Create a new task </Text>
      )}
      <View style={{ width: '100%' }}>
        <FormInput
          label="Task"
          value={itemName}
          onChangeText={setItemName}
          placeholder="Name of the task..."
        />
      </View>
      <View style={styles.dateTimeContainer}>
        <Pressable style={styles.dateTimeButton} onPress={() => showDateTimePicker(true, true)}>
          <Text style={styles.dateTimeText}>
            {dateInput ? new Date(dateInput).toLocaleDateString() : 'Date'}
          </Text>
        </Pressable>
        <Pressable style={styles.dateTimeButton} onPress={() => showDateTimePicker(true, false)}>
          <Text style={styles.dateTimeText}>
            {dateInput ? new Date(dateInput).toLocaleTimeString() : 'Start Time'}
          </Text>
        </Pressable>
      </View>
      <View style={styles.switchContainer}>
        <SwitchInput
          label="Add Note"
          value={showNote}
          trueLabel="Add note"
          falseLabel=""
          leftLabelOff={true}
          onValueChange={(value) => setShowNote(value)}
        />
      </View>
      {showNote && (
        <View style={{ width: '100%' }}>
          <FormInput
            label="Note"
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Enter note (optional)"
            />
        </View>
      )}
      <View style={styles.switchContainer}>
        <SwitchInput
          label="Add Priority"
          value={showPriority}
          trueLabel="Add priority"
          falseLabel=""
          leftLabelOff={true}
          onValueChange={(value) => setShowPriority(value)}
        />
      </View>
      {showPriority && (
        <View style={{ width: '100%' }}>
          <PickerInput
            label="Priority"
            selectedValue={priority?.toString() || ''}
            onValueChange={(itemValue) => setPriority(Number(itemValue))}
            items={priorityItems}
          />
        </View>
      )}
      <View style={styles.switchContainer}>
        <SwitchInput
          label="Add Repeat"
          value={repeat ? true : false}
          trueLabel="Repeats"
          falseLabel=""
          leftLabelOff={true}
          onValueChange={(value) => {
            setRepeat(value ? 'true' : 'false');
            setShowFrequency(value);
          }}
        />
      </View>
      {showFrequency && (
        <View style={styles.switchContainer}>
          <PickerInput
            label="Frequency"
            selectedValue={frequency || ''}
            onValueChange={(itemValue) => {
              if (itemValue === '') {
                setFrequency('');
              } else {
                // Set the frequency to the first option of the selected frequency type
                const firstOption = getFrequencyOptions(itemValue)[0];
                setFrequency(firstOption ? firstOption.value : '');
              }
            }}
            items={frequencyItems}
          />
          {frequency && frequency !== '' && (
            <PickerInput
              label="Frequency details"
              selectedValue={frequency}
              onValueChange={(itemValue) => setFrequency(itemValue)}
              items={getFrequencyOptions(frequencyItems.find(item => 
                getFrequencyOptions(item.value).some(option => option.value === frequency)
              )?.value || '')}
            />
          )}
        </View>
      )}
      <View style={styles.switchContainer}>
        <SwitchInput
          label="Add Pillar"
          value={showPillar}
          trueLabel="Add pillar"
          falseLabel=""
          leftLabelOff={true}
          onValueChange={(value) => setShowPillar(value)}
        />
      </View>
      {showPillar && (
        <View style={{ width: '100%' }}>
          <PickerInput
            label="Pillar"
            selectedValue={selectedPillarUuid?.toString() || ''}
            onValueChange={(itemValue) => setSelectedPillarUuid(itemValue)}
            items={pillarItems}
          />
        </View>
      )}
      <View style={styles.switchContainer}>
        <SwitchInput
          label="Add Objective"
          value={showObjective}
          trueLabel="Add objective"
          falseLabel=""
          leftLabelOff={true}
          onValueChange={(value) => setShowObjective(value)}
        />
      </View>
      {showObjective && (
        <View style={{ width: '100%' }}>
          <PickerInput
            label="Objective"
            selectedValue={objectiveUuid || ''}
            onValueChange={(itemValue) => {
              setObjectiveUuid(itemValue);
              const selectedObjective = objectiveItems.find(item => item.value === itemValue);
              if (selectedObjective && selectedObjective.pillarUuid) {
                setShowPillar(true);
                setSelectedPillarUuid(selectedObjective.pillarUuid);
              }
            }}
            items={objectiveItems}
          />
        </View>
      )}
      <View style={styles.switchContainer}>
        <SwitchInput
          label="Add end time"
          value={showEndDateTime}
          trueLabel="Add end time"
          falseLabel=""
          leftLabelOff={true}
          onValueChange={(value) => setShowEndDateTime(value)}
        />
      </View>
      {showEndDateTime && (
        <View style={styles.dateTimeContainer}>
          <Pressable style={styles.dateTimeButton} onPress={() => showDateTimePicker(false, true)}>
            <Text style={styles.dateTimeText}>
              {endDateInput ? new Date(endDateInput).toLocaleDateString() : 'End Date'}
            </Text>
          </Pressable>
          <Pressable style={styles.dateTimeButton} onPress={() => showDateTimePicker(false, false)}>
            <Text style={styles.dateTimeText}>
              {endDateInput ? new Date(endDateInput).toLocaleTimeString() : 'End Time'}
            </Text>
          </Pressable>
        </View>
      )}
      <Pressable style={[designs.button.marzoSecondary, styles.addButton]} onPress={addNewItem}>
        <Text style={designs.button.buttonText}>{task ? 'Update' : 'Add Task'}</Text>
      </Pressable>
    </View>
  );
  
  return (
    <>
      <UniversalModal isVisible={isOpen} onClose={onClose} modalViewStyle='default'>
        {modalContent}
        {picker}
      </UniversalModal>
      {Platform.OS === 'web' ? (
        showAlert && (
          <AlertModal
            isVisible={showAlert}
            title="Error"
            message="Please enter an item name"
            onConfirm={() => setShowAlert(false)}
            onCancel={() => setShowAlert(false)}
          />
        )
      ) : (
        <AlertModal
          isVisible={showAlert}
          title="Error"
          message="Please enter an item name"
          onConfirm={() => setShowAlert(false)}
          onCancel={() => setShowAlert(false)}
        />
      )}
    </>
  );
};

export default TaskModal;
  
const getStyles = (theme: any) => StyleSheet.create({
  modalContent: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: 'gray',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '90%',
    marginBottom: 20,
  },
  switchContainer: {
    width: '100%',
    // marginBottom: 20,
    // borderWidth: 1,
    // borderColor: 'red'
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  dateTimeButton: {
    flex: 1,
    padding: 10,
    borderColor: theme.borderColor,
    borderWidth: 1,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  dateTimeText: {
    color: theme.textColor,
  },
  addButton: {
    width: '100%',
  },
});