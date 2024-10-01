import { TaskData } from "../../../types/Task";

interface HandlePostponeTaskProps {     
    item: TaskData;
    onUpdateTask: (task: TaskData) => void;
}

export const handlePostponeTask = ({ item, onUpdateTask }: HandlePostponeTaskProps) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDue = new Date(item.due!);
    const currentDueDate = new Date(currentDue.getFullYear(), currentDue.getMonth(), currentDue.getDate());
    
    let newDueDate: Date;

    if (currentDueDate < today) {
        // If due date is in the past, set to today
        newDueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), currentDue.getHours(), currentDue.getMinutes());
    } else {
        // If due date is today or in the future, set to the next day
        newDueDate = new Date(currentDue);
        newDueDate.setDate(newDueDate.getDate() + 1);
    }

    onUpdateTask({ ...item, due: newDueDate.toISOString() });
};