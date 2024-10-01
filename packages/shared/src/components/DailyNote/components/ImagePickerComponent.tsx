// components/ImagePickerComponent.tsx

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    Alert,
    Modal,
    Pressable,
    Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import {
    getImageUrisForDate,
    addImageUri,
    removeImageUri,
} from '@los/shared/src/components/Images/ImageFileManager';

interface ImagePickerComponentProps {
    date: string; // Date in 'YYYY-MM-DD' format
}

const ImagePickerComponent: React.FC<ImagePickerComponentProps> = ({ date }) => {
    const [images, setImages] = useState<string[]>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const { designs, themeColors } = useThemeStyles();

    useEffect(() => {
        // Load images for the given date when the component mounts or date changes
        const loadImages = async () => {
            const imageUris = await getImageUrisForDate(date);
            setImages(imageUris);
        };
        loadImages();
    }, [date]);

    // Request permissions for camera and media library
    const requestPermissions = async (): Promise<boolean> => {
        try {
            // Request camera permissions
            const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
            if (cameraStatus.status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'Camera permissions are required to capture images.'
                );
                return false;
            }

            // Request media library permissions
            const mediaLibraryStatus =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (mediaLibraryStatus.status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'Media library permissions are required to select images.'
                );
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error requesting permissions:', error);
            Alert.alert('Error', 'An error occurred while requesting permissions.');
            return false;
        }
    };

    // Handle image capture using the camera
    const handleCaptureImage = async () => {
        const hasPermissions = await requestPermissions();
        if (!hasPermissions) return;

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true, // Allows user to edit the image (crop, etc.)
                quality: 0.7, // Adjust image quality as needed
            });

            if (!result.canceled) {
                const uri = result.assets[0].uri;
                await addImageUri(date, uri);
                setImages((prevImages) => [...prevImages, uri]);
            }
        } catch (error) {
            console.error('Error capturing image:', error);
            Alert.alert('Error', 'Failed to capture image. Please try again.');
        }
    };

    // Handle image selection from the gallery
    const handleSelectImage = async () => {
        const hasPermissions = await requestPermissions();
        if (!hasPermissions) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
            });

            if (!result.canceled) {
                const uri = result.assets[0].uri;
                await addImageUri(date, uri);
                setImages((prevImages) => [...prevImages, uri]);
            }
        } catch (error) {
            console.error('Error selecting image:', error);
            Alert.alert('Error', 'Failed to select image. Please try again.');
        }
    };

    // Handle image deletion
    const handleDeleteImage = async (index: number) => {
        Alert.alert(
            'Delete Image',
            'Are you sure you want to delete this image?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await removeImageUri(date, index);
                        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
                    },
                },
            ]
        );
    };

    // Handle image preview
    const handlePreviewImage = (uri: string) => {
        setSelectedImage(uri);
        setModalVisible(true);
    };

    // Close the image preview modal
    const closeModal = () => {
        setModalVisible(false);
        setSelectedImage(null);
    };

    return (
        <View style={styles.container}>
            <Text style={designs.text.title}>Daily Pics 📸</Text>
            
            {/* Buttons for capturing and selecting images */}
            <View style={styles.buttonContainer}>
                <Pressable style={[designs.button.primaryButton]} onPress={handleCaptureImage}>
                    <Text style={designs.text.text}>Capture Image</Text>
                </Pressable>
                <Pressable style={[designs.button.primaryButton]} onPress={handleSelectImage}>
                    <Text style={designs.text.text}>Select from Gallery</Text>
                </Pressable>
            </View>

            {/* Display selected images */}
            <ScrollView horizontal style={styles.imageScroll}>
                {images.map((uri, index) => (
                    <View key={index} style={styles.imageWrapper}>
                        <Pressable onPress={() => handlePreviewImage(uri)}>
                            <Image source={{ uri }} style={styles.imageThumbnail} />
                        </Pressable>
                        <Pressable
                            style={styles.deleteIcon}
                            onPress={() => handleDeleteImage(index)}
                        >
                            <MaterialIcons name="close" size={20} color="#fff" />
                        </Pressable>
                    </View>
                ))}
            </ScrollView>

            {/* Modal for image preview */}
            {selectedImage && (
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={closeModal}
                >
                    <Pressable style={styles.modalContainer} onPress={closeModal}>
                        <Image source={{ uri: selectedImage }} style={styles.fullImage} />
                    </Pressable>
                </Modal>
            )}
        </View>
    );
};

export default ImagePickerComponent;

// Styles
const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 10
    },
    imageScroll: {
        marginTop: 10,
    },
    imageWrapper: {
        position: 'relative',
        marginRight: 10,
    },
    imageThumbnail: {
        width: 100,
        height: 100,
        borderRadius: 8,
        resizeMode: 'cover',
    },
    deleteIcon: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 12,
        padding: 2,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '90%',
        height: '70%',
        resizeMode: 'contain',
        borderRadius: 10,
    },
});
