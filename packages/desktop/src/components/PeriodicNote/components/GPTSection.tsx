// Libraries
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import axios from 'axios';

import { BASE_URL } from '@los/shared/src/utilities/constants';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

import { usePeriodicData } from '../hooks/usePeriodicData';

interface GPTSectionProps {
    startDate: Date;
    endDate: Date;
    currentDate: string;
}

type Record = {
    id: string;
    date: string;
    type: string;
    summary: string;
};

const GPTSection: React.FC<GPTSectionProps> = ({
    startDate,
    endDate,
    currentDate,
}) => {
    const { send, on } = window.electron;
    const [dataLoaded, setDataLoaded] = useState(false);
    const [data, setData] = useState<Record | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    const fetchData = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}/gpt/getByDate`, {
                params: { date: currentDate },
            });

            if (response.data) {
                if (response.data.message === "Record not found") {
                    setData(null);
                    setDataLoaded(false);
                    setError(null);
                } else if (response.data.summary) {
                    setData(response.data);
                    setDataLoaded(true);
                    setError(null);
                } else {
                    setData(null);
                    setDataLoaded(false);
                    setError("Invalid data format received.");
                }
            } 
        } catch (error) {
            console.error('Error fetching data:', error);
            setData(null);
            setDataLoaded(false);
            setError("Error fetching data. Please try again.");
        }
    }, [currentDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const { dailyNoteData, timeData, moneyData, moodData, journalData } = usePeriodicData(startDate, endDate);

    const saveDataToJson = async () => {
        const data = {
            dailyNoteData,
            timeData,
            moneyData,
            moodData,
            journalData
        };

        send('save-data', data);
        await new Promise(resolve => setTimeout(resolve, 2000));
        send('run-gpt-generation', 'main.py');
    };

    // Listen for the script completion event from the main process
    useEffect(() => {
        on('python-script-done', (message) => {
            fetchData(); 
        });
    }, []);

    function parseSummary(summary: any) {
        const reflectionRegex = /<reflection>([\s\S]*?)<\/reflection>/;
        const questionsRegex = /<questions_to_ponder>([\s\S]*?)<\/questions_to_ponder>/;
    
        const reflectionMatch = summary.match(reflectionRegex);
        const questionsMatch = summary.match(questionsRegex);
        
        let nicePart = "";
        let notSoNicePart = "";
        let questionsArray = [];

        if (reflectionMatch) {
            const reflectionText = reflectionMatch[1].trim();
            const parts = reflectionText.split(/\n\nNot so nice:\n/);
            if (parts.length > 1) {
                nicePart = parts[0].replace(/^Nice:\s*/, '').trim();
                notSoNicePart = parts[1];
            } else {
                nicePart = reflectionText.replace(/^Nice:\s*/, '');
            }
        }

        if (questionsMatch) {
            const questionsText = questionsMatch[1].trim();
            // Split the questions by numbers followed by a dot and space, e.g., "1. "
            questionsArray = questionsText.split(/\n\d+\. /).slice(1); // Using slice(1) to skip the empty element before the first match
        }

        return {
            reflection: {
                nice: nicePart,
                notSoNice: notSoNicePart
            },
            questionsToPonder: questionsArray
        };
    }

    let parsedContent;
    if (data) {
        parsedContent = parseSummary(data.summary);
    }

    return (
        <View style={styles.gptSection}>
            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : dataLoaded && parsedContent ? (
                <View style={styles.summary}>
                    <View>
                        <Text style={styles.subHeading}>Nice:</Text>
                        <Text style={[designs.text.text, { fontSize: 16}]}>{parsedContent.reflection.nice}</Text>
                        {parsedContent.reflection.notSoNice && (
                            <>
                                <Text style={styles.subHeading}>Not so nice:</Text>
                                <Text style={[designs.text.text, { fontSize: 16}]}>{parsedContent.reflection.notSoNice}</Text>
                            </>
                        )}
                    </View>
                    {parsedContent.questionsToPonder.length > 0 && (
                        <>
                            <Text style={styles.heading}>Questions to Ponder:</Text>
                            {parsedContent.questionsToPonder.map((question: string, index: number) => (
                                <Text key={index} style={[styles.listItem, designs.text.text, { fontSize: 16}]}>
                                    {`${index + 1}. ${question}`}
                                </Text>
                            ))}
                        </>
                    )}
                </View>
            ) : (
                <Pressable style={designs.button.marzoPrimary} onPress={saveDataToJson}>
                    <Text style={designs.button.buttonText}>Generate Summary</Text>
                </Pressable>
            )}
        </View>
    );
};

const getStyles = (theme: any) => {
    return StyleSheet.create({
        gptSection: {
            flex: 1,
            padding: 16,
        },
        summary: {
            marginBottom: 16,
        },
        heading: {
            color: 'gray',
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 8,
            marginTop: 10
        },
        listItem: {
            marginBottom: 4,
        },
        errorText: {
            color: 'gray',
            fontSize: 16,
            textAlign: 'center',
        },
        subHeading: {
            fontSize: 20,
            fontWeight: 'bold',
            marginTop: 8,
            marginBottom: 4,
            color: 'gray'
        },
    });
};

export default GPTSection;