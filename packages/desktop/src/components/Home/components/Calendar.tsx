import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { View, StyleSheet } from 'react-native';

import { BASE_URL } from '@los/shared/src/utilities/constants';
import ViewTaskModal from '@los/shared/src/components/Home/modals/ViewTaskModal'

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

import { TaskData } from '@los/shared/src/types/Task'

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type TasksByDate = { [key: string]: TaskData[] };

const filename = 'Calendar.tsx'

const CustomCalendar: React.FC<{}> = ({}) => {
    const [value, setValue] = useState<Value>(new Date());
    const [tasksByDate, setTasksByDate] = useState<TasksByDate>({});
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [showModal, setShowModal] = useState(false);

    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    const toLocalDateString = (isoDate: string): string => {
        const date = new Date(isoDate);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return localDate.toISOString().split('T')[0];
    };

    const isCurrentDay = (date: Date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const tileClassName = ({ date, view }: { date: Date; view: string }) => {
        // Highlight the current day with a specific class
        if (view === 'month' && isCurrentDay(date)) {
            return 'current-day'; // This class can be defined in your CSS
        }
        // Add different classes based on the completion state of the items for that day
        const localDateString = toLocalDateString(date.toISOString());
        if (tasksByDate[localDateString]) {
            const allCompleted = tasksByDate[localDateString].every(task => task.completed);
            return allCompleted ? 'completed-tasks' : 'incomplete-tasks'; // These classes can be defined in your CSS
        }
        return null;
    };

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`${BASE_URL}/tasks/list`);
                const tasks: TaskData[] = await response.json();
                const tasksMap: TasksByDate = {};
        
                tasks.forEach((task) => {
                    const localDateString = toLocalDateString(task.due!);
                    if (!tasksMap[localDateString]) {
                        tasksMap[localDateString] = [];
                    }
                    tasksMap[localDateString].push(task);
                    });
        
                        setTasksByDate(tasksMap);
                } catch (error) {
                    console.error('Failed to fetch tasks:', error);
                }
            };
    
        fetchTasks();
    }, []);

    const renderTileContent = ({ date, view }: { date: Date; view: string }) => {
        const localDateString = toLocalDateString(date.toISOString());
        if (view === 'month' && tasksByDate[localDateString]) {
            // Check if there's at least one task that is not completed (completed: false)
            const isAnyTaskIncomplete = tasksByDate[localDateString].some(task => !task.completed);
            // Set the dot color based on the completion state
            const dotColor = isAnyTaskIncomplete ? 'yellow' : 'green';
            return <div className={`task-dot ${dotColor}`} />; // Apply the color as a class
        }
        return null;
    };
    
    const handleDayClick = (value: Date) => {
        const localDateString = toLocalDateString(value.toISOString());
        setSelectedDate(localDateString);
        if (tasksByDate[localDateString]) {
            setShowModal(true);
        }
    };

    const toggleTaskCompletion = async (taskId: number) => {
        try {
            const response = await fetch(`${BASE_URL}/tasks/toggleTask`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemId: taskId }),
            });
            const updatedTask = await response.json();
            
            // Now, update the tasksByDate state to reflect the change
            setTasksByDate(prevTasksByDate => {
                // Find the date of the task that was toggled
                const taskDate = toLocalDateString(updatedTask.due);
                // Map through the tasks to update the completed status of the toggled task
                const updatedTasks = prevTasksByDate[taskDate].map(task => 
                task.id === taskId ? { ...task, completed: updatedTask.completed } : task
                );
                // Return the updated tasksByDate with the modified tasks for the specific date
                return { ...prevTasksByDate, [taskDate]: updatedTasks };
            });
        } catch (error) {
            console.error('Failed to toggle task completion:', error);
        }
    };

    // const fetchDayItems = async (date: string) => {
    //     const response = await fetch(`${BASE_URL}/tasks/list?date=${date}`);
    //     const tasks: TaskData[] = await response.json();
    //     return { checklistItems: tasks };
    // };

    const capitalizeFirstLetter = (string: string) => {
        return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };
    
    return (
        <View style={styles.calendarContainer}>
            <Calendar
                onChange={(newDate: Value) => setValue(newDate)} // Update the state with the new date
                value={value}
                tileClassName={tileClassName}
                tileContent={renderTileContent}
                onClickDay={handleDayClick}
                locale="en-GB" // Use British English locale (Monday as first day of week)
                formatMonthYear={(locale, date) => capitalizeFirstLetter(date.toLocaleString('en-US', { month: 'long', year: 'numeric' }))}
                formatShortWeekday={(locale, date) => capitalizeFirstLetter(date.toLocaleString('en-US', { weekday: 'short' }))}
                showWeekNumbers={true}
                onClickWeekNumber={(weekNumber, date) => console.log(weekNumber, date)}
            />
            {/* <ViewTaskModal
                showModal={showModal}
                setShowModal={setShowModal}
                initialDate={selectedDate}
                fetchDayItems={fetchDayItems}
                toggleItemCompletion={toggleTaskCompletion}
                deleteTask={deleteTask}
                updateChecklistItems={updateChecklistItems}
            /> */}
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    calendarContainer: {
        width: '80%',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 4
    },
});

export default CustomCalendar;
