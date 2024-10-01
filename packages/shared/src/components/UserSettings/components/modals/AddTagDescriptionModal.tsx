import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, Modal, FlatList, Platform } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMoneyBill, faClock, faSmile } from '@fortawesome/free-solid-svg-icons';


import AlertModal from '@los/shared/src/components/modals/AlertModal'; // Add this import
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { TagData } from '@los/shared/src/types/TagsAndDescriptions';

let ColorPicker: any;
if (Platform.OS === 'web') {
  ColorPicker = null
} else {
  ColorPicker = require('./components/ColorPicker').default;
}

interface AddTagDescriptionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAdd: (itemData: TagData) => void;
  initialData?: TagData;
  getTagsForSelection: (type: string) => TagData[];
  currentSection: string;
  getLinkedDescriptions: (tag: string) => TagData[];
}

const AddTagDescriptionModal: React.FC<AddTagDescriptionModalProps> = ({
  isVisible,
  onClose,
  onAdd,
  initialData,
  getTagsForSelection,
  currentSection,
  getLinkedDescriptions,
}) => {
  const { themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors);

  const [itemData, setItemData] = useState<TagData>({
    text: '',
    type: '',
    emoji: '',
    linkedTag: '',
    color: '#FFFFFF'
  });
  const [availableTags, setAvailableTags] = useState<TagData[]>([]);
  const [selectedSection, setSelectedSection] = useState(currentSection);
  const [isTagSelected, setIsTagSelected] = useState(true);
  const [isTagSelectionModalVisible, setIsTagSelectionModalVisible] = useState(false);

  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [tempColor, setTempColor] = useState('#FFFFFF');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const [showWarning, setShowWarning] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [linkedDescriptions, setLinkedDescriptions] = useState<TagData[]>([]);

  useEffect(() => {
    if (initialData) {
      setItemData(initialData);
      setIsTagSelected(initialData.type.includes('Tag'));
      setSelectedSection(initialData.type.includes('money') ? 'money' : initialData.type.includes('time') ? 'time' : 'mood');
      setSelectedColor(initialData.color || '#FFFFFF');
    } else {
      resetForm();
    }
  }, [initialData, currentSection]);

  const resetForm = () => {
    setItemData({
      text: '',
      type: `${currentSection}Tag`,
      emoji: '',
      linkedTag: '',
      color: '#FFFFFF'
    });
    setSelectedSection(currentSection);
    setIsTagSelected(true);
    setSelectedColor('#FFFFFF');
  };

  const openTagSelectionModal = useCallback(() => {
    const tags = getTagsForSelection(selectedSection);
    setAvailableTags(tags);
    setIsTagSelectionModalVisible(true);
  }, [selectedSection, getTagsForSelection])


  const handleAdd = () => {
    if (!itemData.text) {
      setAlertMessage('Please enter a tag or description');
      setAlertModalVisible(true);
      return;
    }
    if ((itemData.type === 'moneyDescription' || itemData.type === 'timeDescription') && !itemData.linkedTag) {
      setAlertMessage('Linked tag should be set for descriptions');
      setAlertModalVisible(true);
      return;
    }

    // Ensure the type is correctly set before adding
    const updatedItemData = {
      ...itemData,
      type: `${selectedSection}${isTagSelected ? 'Tag' : 'Description'}`,
      color: isTagSelected ? selectedColor : undefined
    };

    onAdd(updatedItemData);
    onClose();
    resetForm();
  };

  const updateItemData = (key: keyof TagData, value: string) => {
    setItemData(prev => ({ ...prev, [key]: value }));
  };

  const renderSectionSelector = () => (
    <View style={styles.sectionSelectorContainer}>
      {[
        { key: 'money', icon: faMoneyBill },
        { key: 'time', icon: faClock },
        { key: 'mood', icon: faSmile }
      ].map((section) => (
        <Pressable
          key={section.key}
          style={[styles.sectionButton, selectedSection === section.key && styles.activeSectionButton]}
          onPress={() => {
            setSelectedSection(section.key);
            updateItemData('type', `${section.key}${isTagSelected ? 'Tag' : 'Description'}`);
          }}
        >
          <FontAwesomeIcon 
            icon={section.icon} 
            color={selectedSection === section.key ? themeColors.backgroundColor : themeColors.textColor} 
            size={24} 
          />
        </Pressable>
      ))}
    </View>
  );

  const renderTagTypeSelector = () => (
    <View style={styles.tagTypeSelectorContainer}>
      <Pressable
        style={[styles.tagTypeButton, isTagSelected && styles.activeTagTypeButton]}
        onPress={() => {
          setIsTagSelected(true);
          updateItemData('type', `${selectedSection}Tag`);
          updateItemData('linkedTag', '');
          setShowWarning(false);
        }}
      >
        <Text style={[designs.text.text, isTagSelected && styles.activeTagTypeText]}>Tag</Text>
      </Pressable>
      {selectedSection !== 'mood' && (
        <Pressable
          style={[styles.tagTypeButton, !isTagSelected && styles.activeTagTypeButton]}
          onPress={() => {
            if (initialData && initialData.type.includes('Tag') && getLinkedDescriptions) {
              const descriptions = getLinkedDescriptions(initialData.text);
              if (descriptions.length > 0) {
                setLinkedDescriptions(descriptions);
                setShowWarning(true);
              } else {
                handleTagTypeChange();
              }
            } else {
              handleTagTypeChange();
            }
          }}
        >
          <Text style={[designs.text.text, !isTagSelected && styles.activeTagTypeText]}>Description</Text>
        </Pressable>
      )}
    </View>
  );

  const handleTagTypeChange = () => {
    setIsTagSelected(false);
    updateItemData('type', `${selectedSection}Description`);
    setShowWarning(false);
  };

  const renderTagSelectionModal = () => (
    <Modal visible={isTagSelectionModalVisible} transparent animationType="fade">
      <View style={designs.modal.modalContainer}>
        <View style={designs.modal.modalView}>
          <Text style={designs.text.title}>Select a Tag</Text>
          <FlatList
            data={availableTags}
            keyExtractor={(item) => item.uuid!}
            renderItem={({ item }) => (
              <Pressable
                style={styles.tagItem}
                onPress={() => {
                  updateItemData('linkedTag', item.text);
                  setIsTagSelectionModalVisible(false);
                }}
              >
                <Text style={designs.text.text}>{item.emoji} {item.text}</Text>
              </Pressable>
            )}
          />
          <Pressable style={designs.button.marzoPrimary} onPress={() => setIsTagSelectionModalVisible(false)}>
            <Text style={designs.button.buttonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
  
  const handleColorSelect = (color: string) => {
    setTempColor(color);
  };

  const confirmColor = () => {
    setSelectedColor(tempColor);
    updateItemData('color', tempColor);
    setShowColorPicker(false);
  };

  const renderColorPicker = () => {
    if (!ColorPicker) return null;

    return (
      <Modal visible={showColorPicker} transparent animationType="fade">
        <View style={styles.colorPickerContainer}>
          <View style={styles.colorPickerContent}>
            <ColorPicker
              onColorSelected={handleColorSelect}
              style={{ width: '100%', height: 600 }}
              initialColor={selectedColor}
            />
            <View style={styles.colorPickerButtons}>
              <Pressable style={[designs.button.marzoPrimary, { width: '40%'}]} onPress={() => setShowColorPicker(false)}>
                <Text style={designs.button.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable style={[designs.button.marzoSecondary, { width: '40%'}]} onPress={confirmColor}>
                <Text style={designs.button.buttonText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderWarningModal = () => (
    <Modal visible={showWarning} transparent animationType="fade">
      <View style={designs.modal.modalContainer}>
        <View style={designs.modal.modalView}>
          <Text style={designs.text.title}>Warning</Text>
          <Text style={designs.text.text}>
            This tag has {linkedDescriptions.length} linked description(s). Changing it to a description may cause inconsistencies.
          </Text>
          <Text style={designs.text.text}>Do you want to proceed?</Text>
          <View style={styles.modalButtonContainer}>
            <Pressable style={designs.button.marzoPrimary} onPress={() => setShowWarning(false)}>
              <Text style={designs.button.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable style={designs.button.marzoSecondary} onPress={handleTagTypeChange}>
              <Text style={designs.button.buttonText}>Proceed</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderInputFields = () => {
    return (
      <>
        <TextInput
          placeholder={isTagSelected ? "Tag" : "Description"}
          placeholderTextColor="gray"
          value={itemData.text}
          onChangeText={(text) => updateItemData('text', text)}
          style={[designs.text.input]}
        />
        {selectedSection !== 'mood' && (
          <>
            <TextInput
              placeholder="Emoji (optional)"
              placeholderTextColor="gray"
              value={itemData.emoji}
              onChangeText={(emoji) => updateItemData('emoji', emoji)}
              style={[designs.text.input]}
            />
            {!isTagSelected && (
              <Pressable
                style={[designs.text.input, { marginVertical: 10 }]}
                onPress={openTagSelectionModal}
              >
                <Text style={designs.text.text}>{itemData.linkedTag || "Select a Tag"}</Text>
              </Pressable>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={designs.modal.modalContainer}>
        <View style={designs.modal.modalView}>
        <Text style={[designs.text.title]}>
            {initialData
              ? 'Edit Item'
              : `Add ${isTagSelected ? 'Tag' : 'Description'} for ${selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}`}
          </Text>
          <>
            {renderSectionSelector()}
            {renderTagTypeSelector()}
          </>
          {renderInputFields()}
          {renderTagSelectionModal()}
          {ColorPicker && isTagSelected && (
            <View style={styles.colorSelectionContainer}>
              <Pressable
                style={styles.colorPickerButton}
                onPress={() => setShowColorPicker(true)}
              >
                <View style={[styles.colorDot, { backgroundColor: selectedColor }]} />
                <Text style={styles.colorPickerButtonText}>Open Color Picker</Text>
              </Pressable>
            </View>
          )}
          {renderColorPicker()}
          <View style={styles.modalButtonContainer}>
            <Pressable style={designs.button.marzoPrimary} onPress={onClose}>
              <Text style={designs.button.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable style={designs.button.marzoSecondary} onPress={handleAdd}>
              <Text style={designs.button.buttonText}>{initialData ? 'Update' : 'Add'} Item</Text>
            </Pressable>
          </View>
          {renderWarningModal()}
        </View>
      </View>
      {alertModalVisible && 
        <AlertModal
          isVisible={alertModalVisible}
          title="Warning"
          message={alertMessage}
          onConfirm={() => setAlertModalVisible(false)}
          onCancel={() => setAlertModalVisible(false)}
        />
      }
    </Modal>
  );
};


const getStyles = (theme: any) => StyleSheet.create({
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  tagItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  sectionSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 20,
    marginBottom: 20,
  },
  sectionButton: {
    padding: 10,
    borderRadius: 5,
  },
  activeSectionButton: {
    backgroundColor: theme.hoverColor,
  },
  tagTypeSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tagTypeButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.borderColor,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeTagTypeButton: {
    backgroundColor: theme.hoverColor,
  },
  activeTagTypeText: {
    color: theme.backgroundColor,
  },
  colorPickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  colorPickerContent: {
    backgroundColor: theme.backgroundColor,
    borderRadius: 10,
    padding: 20,
    width: '90%',
    height: 500,
  },
  colorSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: 'red',
    marginVertical: 10,
  },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  colorPickerButton: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: 'blue',
  },
  colorPickerButtonText: {
    marginLeft: 15,
    color: theme.textColor,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  colorPickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default AddTagDescriptionModal;