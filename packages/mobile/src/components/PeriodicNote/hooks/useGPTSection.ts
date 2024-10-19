import { useState, useEffect } from 'react';
import axios from 'axios';
import { databaseManagers } from '../../../database/tables';
import { usePeriodicData } from './usePeriodicData';
import { useTextSection } from './useTextSection';
import { useObjectives } from './useObjectives';
import { getFlaskServerURL } from '../../Database/hooks/databaseConfig';
import { getWeekNumber } from '@los/shared/src/utilities/timeUtils';

interface ParsedContent {
    reflection: {
        nice: string;
        notSoNice: string;
    };
    questionsToPonder: string[];
}

export const useGPTSection = (startDate: Date, endDate: Date, currentDate: string) => {
    const [aiSummary, setAiSummary] = useState<ParsedContent | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorAlertVisible, setIsErrorAlertVisible] = useState(false);

    const { current } = usePeriodicData(startDate, endDate);
    const { dailyNoteData, timeData, moneyData, moodData, journalData } = current;

    const periodType = currentDate.includes('-W') ? 'week' : 'month';
    const { handleInputChange: handleTextInputChange, refetchData: fetchTextData } = useTextSection({ periodType, startDate, endDate });
    const { addObjective } = useObjectives(currentDate);

    useEffect(() => {
        fetchAiSummary();
    }, [currentDate]);

    const fetchAiSummary = async () => {
        setIsLoading(true);
        try {
            const gptResponse = await databaseManagers.gpt.getByDate(currentDate);
            if (gptResponse && gptResponse.length > 0) {
                const parsedContent = parseAISummary(gptResponse[0].summary);
                setAiSummary(parsedContent);
                setError(null);
            } else {
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

    const generateSummary = async () => {
        setIsLoading(true);
        try {
            const data: any = {
                dailyNoteData,
                timeData,
                moneyData,
                moodData,
                journalData,
                currentDate
            };

            if (periodType === 'month') {
                // Fetch all weekly AI summaries for the current month
                const weeklySummaries = await fetchWeeklySummariesForMonth(currentDate);
                data.weeklyAISummaries = weeklySummaries;
            }
    
            const flaskURL = await getFlaskServerURL();
            const endpoint = periodType === 'week' ? 'weekly_summary' : 'monthly_summary';
            const response = await axios.post(`${flaskURL}/${endpoint}`, data);
    
            if (response.data && response.data.mood_summary) {
                const moodSummary = response.data.mood_summary;
                
                // Save to database
                await databaseManagers.gpt.upsert({
                    date: moodSummary.date,
                    type: moodSummary.type,
                    summary: moodSummary.claude_summary,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
    
                // Process GPT summary
                if (moodSummary.gpt_summary) {
                    const gptSummary = moodSummary.gpt_summary;
                    
                    // Save successes, areas for improvement, and insights
                    ['successes', 'areas_for_improvement', 'insights'].forEach((key) => {
                        gptSummary[key].forEach((item: string) => {
                            handleTextInputChange({ 
                                text: item + ' 🤖', 
                                period: currentDate, 
                                key: key === 'successes' ? 'success' : key === 'areas_for_improvement' ? 'beBetter' : 'think'
                            });
                        });
                    });
    
                    // Save next week goals as objectives
                    if (Array.isArray(gptSummary.next_week_goals)) {
                        const nextPeriodDate = periodType === 'week' ? getNextWeekDate(currentDate) : getNextMonthDate(currentDate);
                        gptSummary.next_week_goals.forEach((goalData: any) => {
                            addObjective({
                                objective: goalData.goal + ' 🤖',
                                completed: false,
                                pillarUuid: goalData.pillar_uuid,
                                pillarEmoji: goalData.pillar_emoji,
                                period: nextPeriodDate,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            });
                        });
                    }
                }
    
                await fetchAiSummary();
                await fetchTextData();
                console.log('Summary generated and saved successfully');
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

    const fetchWeeklySummariesForMonth = async (monthDate: string) => {
        const [year, month] = monthDate.split('-');
        const weeklySummaries = [];
        
        for (let week = 1; week <= 5; week++) {
            const weekDate = `${year}-W${week.toString().padStart(2, '0')}`;
            if (getWeekNumber(new Date(weekDate)) <= parseInt(month)) {
                const summary = await databaseManagers.gpt.getByDate(weekDate);
                if (summary && summary.length > 0) {
                    weeklySummaries.push(summary[0]);
                }
            }
        }
        
        return weeklySummaries;
    };

    const getNextWeekDate = (currentDate: string) => {
        const [year, week] = currentDate.split('-W');
        const nextWeek = parseInt(week) + 1;
        return `${year}-W${nextWeek.toString().padStart(2, '0')}`;
    };

    const getNextMonthDate = (currentDate: string) => {
        const [year, month] = currentDate.split('-');
        const nextMonth = parseInt(month) + 1;
        if (nextMonth > 12) {
            return `${parseInt(year) + 1}-01`;
        }
        return `${year}-${nextMonth.toString().padStart(2, '0')}`;
    };

    return {
        aiSummary,
        error,
        isLoading,
        isAlertVisible,
        errorMessage,
        isErrorAlertVisible,
        setIsAlertVisible,
        setIsErrorAlertVisible,
        generateSummary,
    };
};