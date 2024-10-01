import { databaseManagers } from "../../../database/tables";

export const fetchNextTask = async (
    setNextTask: (taskText: string | null) => void, 
    setTimeLeft: (timeLeft: string | null) => void
) => {
    const response = await databaseManagers.tasks.getNextTask();
    if (response.item && response.timeLeft) {
        const taskText = response.item.text;
        const timeUntilExpiration = response.timeLeft; // Assuming this is in milliseconds
    
        setNextTask(taskText);
        setTimeLeft(timeUntilExpiration); // Update your state as needed
    } else {
        setNextTask(null);
        setTimeLeft(null);
    }
};