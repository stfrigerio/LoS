import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import axios from 'axios';


import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { databaseManagers } from '../../../database/tables';
import { usePeriodicData } from '../hooks/usePeriodicData';
import { getFlaskServerURL } from '../../Database/hooks/databaseConfig';

import AlertModal from '@los/shared/src/components/modals/AlertModal';

interface GPTSectionProps {
    startDate: Date;
    endDate: Date;
    currentDate: string;
}

interface ParsedContent {
    reflection: {
        nice: string;
        notSoNice: string;
    };
    questionsToPonder: string[];
}

const GPTSection: React.FC<GPTSectionProps> = ({ startDate, endDate, currentDate }) => {
    const [aiSummary, setAiSummary] = useState<ParsedContent | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorAlertVisible, setIsErrorAlertVisible] = useState(false);

    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    const { dailyNoteData, timeData, moneyData, moodData, journalData } = usePeriodicData(startDate, endDate);

    useEffect(() => {
        const fetchAiSummary = async () => {
            setIsLoading(true);
            try {
                const gptResponse = await databaseManagers.gpt.getByDate(currentDate);
                if (gptResponse && gptResponse.length > 0) {
                    const parsedContent = parseAISummary(gptResponse[0].summary);
                    setAiSummary(parsedContent);
                    setError(null);
                } else {
                    // No summary found for the current date
                    setAiSummary(null);
                    setError(null);
                }
            } catch (error) {
                console.error('Error fetching AI summary:', error);
                setAiSummary(null);
                setError("Error fetching AI summary. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAiSummary();
    }, [currentDate]);

    const parseAISummary = (content: string): ParsedContent => {
        const reflectionMatch = content.match(/<reflection>([\s\S]*?)<\/reflection>/);
        const questionsMatch = content.match(/<questions_to_ponder>([\s\S]*?)<\/questions_to_ponder>/);

        const reflection = reflectionMatch ? reflectionMatch[1].trim() : '';
        const questions = questionsMatch ? questionsMatch[1].trim() : '';

        const [nice, notSoNice] = reflection.split('Not so nice:').map(part => part.replace('Nice:', '').trim());

        const questionsList = questions.split('\n')
            .filter(q => q.trim())
            .map(q => q.replace(/^\d+\.\s*/, '').trim());

        return {
            reflection: { nice, notSoNice },
            questionsToPonder: questionsList
        };
    };

    const handleGenerateSummary = () => {
        setIsAlertVisible(true);
    };

    const generateSummary = async () => {
        setIsLoading(true);
        try {
            const data = {
                dailyNoteData,
                timeData,
                moneyData,
                moodData,
                journalData
            };
    
            const flaskURL = await getFlaskServerURL();
        
            const response = await axios.post(`${flaskURL}/weekly_summary`, data);
    
            if (response.data && response.data.mood_summary) {
                const summaryData = response.data.mood_summary;
                
                // Prepare data for database insertion
                const gptData = {
                    date: summaryData.date,
                    type: summaryData.type,
                    summary: summaryData.summary,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
    
                // Save to database
                await databaseManagers.gpt.upsert(gptData);
    
                // Refetch the summary
                const fetchedSummary = await databaseManagers.gpt.getByDate(currentDate);
                if (fetchedSummary && fetchedSummary.length > 0) {
                    const parsedContent = parseAISummary(fetchedSummary[0].summary);
                    setAiSummary(parsedContent);
                    setError(null);
                    // Add this line to indicate success
                    console.log('Summary generated and saved successfully');
                } else {
                    throw new Error("Failed to fetch saved summary");
                }
            } else {
                throw new Error("Failed to generate summary: Unexpected response format");
            }
        } catch (error) {
            console.error('Error generating or saving summary:', error);
            let message = "Error generating or saving summary. Please try again.";
            if (error instanceof Error) {
                message += ` ${error.message}`;
            }
            setErrorMessage(message);
            setIsErrorAlertVisible(true);
        } finally {
            setIsLoading(false);
        }
    };

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
                <Pressable style={designs.button.marzoPrimary} onPress={handleGenerateSummary}>
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