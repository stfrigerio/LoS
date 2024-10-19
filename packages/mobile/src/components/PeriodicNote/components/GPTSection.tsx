import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import AlertModal from '@los/shared/src/components/modals/AlertModal';
import { useGPTSection } from '../hooks/useGPTSection';

interface GPTSectionProps {
    startDate: Date;
    endDate: Date;
    currentDate: string;
}

const GPTSection: React.FC<GPTSectionProps> = ({ startDate, endDate, currentDate }) => {
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    const {
        aiSummary,
        error,
        isLoading,
        isAlertVisible,
        errorMessage,
        isErrorAlertVisible,
        setIsAlertVisible,
        setIsErrorAlertVisible,
        generateSummary,
    } = useGPTSection(startDate, endDate, currentDate);

    if (isLoading) {
        return (
            <View style={styles.noTextcontainer}>
                <Text style={styles.noDataText}>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.noTextcontainer}>
                <Text style={styles.noDataText}>{error}</Text>
                <Pressable style={designs.button.marzoPrimary} onPress={generateSummary}>
                    <Text style={designs.button.buttonText}>Generate Summary</Text>
                </Pressable>
            </View>
        );
    }

    if (!aiSummary) {
        return (
            <View style={styles.noTextcontainer}>
                <Pressable style={designs.button.marzoPrimary} onPress={() => setIsAlertVisible(true)}>
                    <Text style={designs.button.buttonText}>Generate Summary</Text>
                </Pressable>
                {isAlertVisible && (
                    <AlertModal
                        isVisible={isAlertVisible}
                        title="Generate Summary"
                        message="Are you sure you want to ask your desktop for a summary? This may take a moment."
                        onConfirm={() => {
                            setIsAlertVisible(false);
                            generateSummary();
                        }}
                        onCancel={() => setIsAlertVisible(false)}
                    />
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.subheading}>Nice:</Text>
            <Text style={styles.text}>{aiSummary.reflection.nice}</Text>
            <Text style={styles.subheading}>Not so nice:</Text>
            <Text style={styles.text}>{aiSummary.reflection.notSoNice}</Text>
            
            <Text style={styles.heading}>Questions to Ponder:</Text>
            {aiSummary.questionsToPonder.map((question, index) => (
                <Text key={index} style={styles.listItem}>
                    {`${index + 1}. ${question}`}
                </Text>
            ))}
            {isErrorAlertVisible && (
                <AlertModal
                    isVisible={isErrorAlertVisible}
                    title="Error"
                    message={errorMessage}
                    onConfirm={() => setIsErrorAlertVisible(false)}
                    onCancel={() => setIsErrorAlertVisible(false)}
                />
            )}
        </View>
    );
};
const getStyles = (theme: any) => {
    return StyleSheet.create({
        container: {
            padding: 16,
        },
        heading: {
            fontSize: 16,
            fontWeight: 'bold',
            color: 'gray',
            marginBottom: 12,
            marginTop: 16,
        },
        subheading: {
            fontSize: 14,
            color: 'gray',
            fontWeight: 'bold',
            marginBottom: 8,
            marginTop: 8,
        },
        text: {
            fontSize: 12,
            color: theme.textColor,
            marginBottom: 12,
        },
        listItem: {
            fontSize: 12,
            marginBottom: 8,
            color: theme.textColor
        },
        noTextcontainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        noDataText: {
            fontSize: 16,
            color: 'gray',
            fontStyle: 'italic',
        },
    });
}

export default GPTSection;