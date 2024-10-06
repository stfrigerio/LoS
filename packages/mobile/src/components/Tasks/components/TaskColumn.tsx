import React from 'react';
import { View } from 'react-native';
import { ExtendedTaskData } from '@los/shared/src/types/Task';

interface TaskColumnProps {
    tasks: ExtendedTaskData[];
    children: (task: ExtendedTaskData) => React.ReactNode;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({ tasks, children }) => (
    <View style={{ width: '34%', marginHorizontal: 5 }}>
        {tasks.map((task) => task.uuid!.startsWith('fake-') ? null : children(task))}
    </View>
);