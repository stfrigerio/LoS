import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheckCircle, faCircle, faTrash, faPlus, faChevronDown, faChevronUp, faEdit } from '@fortawesome/free-solid-svg-icons';

import AddChecklistModal from '../modals/AddChecklistModal';
// import GluedQuickbutton from '../../../sharedComponents/NavBar/GluedQuickbutton';
import Collapsible from '../../../sharedComponents/Collapsible';

import { useThemeStyles } from '../../../styles/useThemeStyles';
import { TaskData } from '../../../types/Task';

interface ChecklistProps {
    tasks: TaskData[];
    addTask: (task: Partial<TaskData>) => void;
    updateTask: (task: TaskData) => void;
    deleteTask: (uuid: string) => void;
    refreshTasks: () => void;
}

interface ChecklistData {
    name: string;
    color: string;
    collapsed: boolean;
}

const Checklist: React.FC<ChecklistProps> = ({ tasks, addTask, updateTask, deleteTask, refreshTasks }) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = React.useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);
    const [inputTexts, setInputTexts] = useState<{[key: string]: string}>({});
    const [localTasks, setLocalTasks] = useState(tasks);
    const inputRefs = useRef<{[key: string]: TextInput | null}>({});
    const [checklists, setChecklists] = useState<ChecklistData[]>([]);
    const [activeChecklist, setActiveChecklist] = useState('');
    const [showAddChecklistModal, setShowAddChecklistModal] = useState(false);
    const [editingChecklist, setEditingChecklist] = useState<ChecklistData | null>(null);

    useEffect(() => {
        setLocalTasks(tasks);
    }, [tasks]);

    // Function to generate a random color
    const getRandomColor = useCallback(() => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }, []);

    const getContrastColor = (hexColor: string): string => {
        // Remove the hash if it's there
        hexColor = hexColor.replace('#', '');
    
        // Convert to RGB
        const r = parseInt(hexColor.substr(0, 2), 16);
        const g = parseInt(hexColor.substr(2, 2), 16);
        const b = parseInt(hexColor.substr(4, 2), 16);
    
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
        // Return black for bright colors, white for dark colors
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    };
    
    // Function to reconstruct checklists from tasks
    const reconstructChecklists = useCallback((taskList: TaskData[]) => {
        const checklistMap = new Map<string, ChecklistData>();
        
        taskList.forEach(task => {
            if (task.type && task.type.startsWith('checklist_')) {
                const checklistName = task.type.split('_')[1];
                if (!checklistMap.has(checklistName)) {
                    checklistMap.set(checklistName, {
                        name: checklistName,
                        color: getRandomColor(), // Assign a random color
                        collapsed: false
                    });
                }
            }
        });

        return Array.from(checklistMap.values());
    }, [getRandomColor]);

    // Use useMemo to derive checklists from tasks
    const derivedChecklists = useMemo(() => reconstructChecklists(tasks), [tasks, reconstructChecklists]);

    // Effect to update checklists when tasks change
    useEffect(() => {
        setLocalTasks(tasks);
        setChecklists(prevChecklists => {
            const newChecklists = derivedChecklists;
            // Preserve collapsed state and color from previous checklists
            return newChecklists.map(newChecklist => {
                const prevChecklist = prevChecklists.find(pc => pc.name === newChecklist.name);
                return {
                    ...newChecklist,
                    collapsed: prevChecklist?.collapsed || false,
                    color: prevChecklist?.color || newChecklist.color
                };
            });
        });
        // Set active checklist if not set or no longer exists
        setActiveChecklist(prevActive => 
            derivedChecklists.some(cl => cl.name === prevActive) 
                ? prevActive 
                : (derivedChecklists[0]?.name || '')
        );
    }, [tasks, derivedChecklists]);

    const addItem = useCallback(async (checklistName: string) => {
        const inputText = inputTexts[checklistName] || '';
        if (inputText.trim()) {
            try {
                const newTask = {
                    text: inputText.trim(),
                    completed: false,
                    type: `checklist_${checklistName}`,
                };
                addTask(newTask);
                setInputTexts(prev => ({ ...prev, [checklistName]: '' }));
                refreshTasks();
                setTimeout(() => {
                    inputRefs.current[checklistName]?.focus();
                }, 50);
            } catch (error) {
                console.error('Error adding checklist item:', error);
            }
        } else {
            inputRefs.current[checklistName]?.focus();
        }
    }, [inputTexts, addTask, refreshTasks]);

    const handleInputChange = (text: string, checklistName: string) => {
        setInputTexts(prev => ({ ...prev, [checklistName]: text }));
    };

    const toggleItem = useCallback(async (task: TaskData) => {
        try {
            const updatedTask = { 
                ...task,
                completed: !task.completed 
            };
            updateTask(updatedTask);
        } catch (error) {
            console.error('Error toggling checklist item:', error);
        }
    }, [updateTask]);

    const handleAddChecklist = (name: string, color: string) => {
        if (editingChecklist) {
            setChecklists(checklists.map(cl => 
                cl.name === editingChecklist.name ? { ...cl, name, color } : cl
            ));
            // Update tasks with the new checklist name
            localTasks.forEach(task => {
                if (task.type === `checklist_${editingChecklist.name}`) {
                    updateTask({ ...task, type: `checklist_${name}` });
                }
            });
            setEditingChecklist(null);
        } else {
            setChecklists([...checklists, { name, color, collapsed: false }]);
        }
        setActiveChecklist(name);
    };

    const toggleCollapse = (name: string) => {
        setChecklists(checklists.map(cl => 
            cl.name === name ? { ...cl, collapsed: !cl.collapsed } : cl
        ));
    };

    const editChecklist = (checklist: ChecklistData) => {
        setEditingChecklist(checklist);
        setShowAddChecklistModal(true);
    };

    const handleDeleteTask = useCallback(async (uuid: string) => {
        try {
            deleteTask(uuid);
        } catch (error) {
            console.error('Error deleting checklist item:', error);
        }
    }, [deleteTask]);

    const renderItem = useCallback((item: TaskData, textColor: string) => (
        <View key={item.uuid} style={styles.itemContainer}>
            <Pressable onPress={() => toggleItem(item)} style={styles.checkbox}>
                <FontAwesomeIcon 
                    icon={item.completed ? faCheckCircle : faCircle} 
                    color={item.completed ? themeColors.hoverColor : textColor} 
                    size={20} 
                />
            </Pressable>
            <Text style={[styles.itemText, { color: textColor }, item.completed && styles.completedText]}>{item.text}</Text>
            <Pressable onPress={() => handleDeleteTask(item.uuid!)} style={styles.deleteButton}>
                <FontAwesomeIcon icon={faTrash} color={textColor} size={18} />
            </Pressable>
        </View>
    ), [toggleItem, handleDeleteTask, styles, themeColors]);

    const renderChecklist = (checklistData: ChecklistData) => {
        const filteredTasks = localTasks.filter(task => task.type === `checklist_${checklistData.name}`).reverse();
        const textColor = getContrastColor(checklistData.color);
        
        return (
            <View key={checklistData.name} style={[styles.checklistContainer, { backgroundColor: checklistData.color }]}>
                <View style={styles.checklistHeader}>
                    <Text style={[styles.checklistTitle, { color: textColor }]}>{checklistData.name}</Text>
                    <View style={styles.checklistHeaderIcons}>
                        <Pressable onPress={() => editChecklist(checklistData)} style={styles.headerIcon}>
                            <FontAwesomeIcon icon={faEdit} color={textColor} size={18} />
                        </Pressable>
                        <Pressable onPress={() => toggleCollapse(checklistData.name)} style={styles.headerIcon}>
                            <FontAwesomeIcon 
                                icon={checklistData.collapsed ? faChevronDown : faChevronUp} 
                                color={textColor} 
                                size={18} 
                            />
                        </Pressable>
                    </View>
                </View>
                <Collapsible collapsed={checklistData.collapsed}>
                    <View style={[styles.addItemContainer, { backgroundColor: `${checklistData.color}CC` }]}>
                        <TextInput
                            ref={ref => inputRefs.current[checklistData.name] = ref}
                            style={[styles.input, { color: textColor, backgroundColor: `${checklistData.color}99` }]}
                            value={inputTexts[checklistData.name] || ''}
                            onChangeText={(text) => handleInputChange(text, checklistData.name)}
                            placeholder="Add new item"
                            placeholderTextColor={`${textColor}99`}
                            onSubmitEditing={() => addItem(checklistData.name)}
                        />
                        <Pressable onPress={() => addItem(checklistData.name)} style={styles.addButton}>
                            <FontAwesomeIcon icon={faPlus} color={textColor} size={20} />
                        </Pressable>
                    </View>
                    {filteredTasks.map(task => renderItem(task, textColor))}
                </Collapsible>
            </View>
        );
    };

    return (
        <>
            <ScrollView style={styles.container}>
                {checklists.map(renderChecklist)}
                <Pressable onPress={() => {
                    setEditingChecklist(null);
                    setShowAddChecklistModal(true);
                }} style={styles.addChecklistButton}>
                    <Text style={styles.addChecklistButtonText}>Add New Checklist</Text>
                </Pressable>
            </ScrollView>
            {/* {activeChecklist && (
                <GluedQuickbutton screen="checklist" onPress={() => addItem(activeChecklist)} />
            )} */}
            <AddChecklistModal
                visible={showAddChecklistModal}
                onClose={() => {
                    setShowAddChecklistModal(false);
                    setEditingChecklist(null);
                }}
                onAdd={handleAddChecklist}
                initialChecklist={editingChecklist}
            />
        </>
    );
};

const getStyles = (themeColors: any, designs: any) => StyleSheet.create({
    container: {
        // backgroundColor: themeColors.backgroundSecondary,
        borderRadius: 8,
        padding: 10,
        marginTop: 20,
        marginBottom: 80
    },
    addItemContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        marginHorizontal: 10
    },
    input: {
        flex: 1,
        ...designs.text.text,
        backgroundColor: themeColors.backgroundPrimary,
        borderRadius: 8,
        padding: 10,
        marginRight: 10,
    },
    addButton: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginHorizontal: 10
    },
    checkbox: {
        marginRight: 10,
    },
    itemText: {
        ...designs.text.text,
        flex: 1,
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: 'gray',
    },
    deleteButton: {
        padding: 5,
        marginRight: 3,
    },
    checklistContainer: {
        marginBottom: 20,
        borderRadius: 8,
        overflow: 'hidden',
    },
    checklistHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    checklistTitle: {
        ...designs.text.subtitle,
        fontWeight: 'bold',
    },
    addChecklistButton: {
        backgroundColor: themeColors.backgroundTertiary,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    addChecklistButtonText: {
        ...designs.text.text,
        color: themeColors.textColor,
    },
    checklistHeaderIcons: {
        flexDirection: 'row',
    },
    headerIcon: {
        padding: 5,
        marginLeft: 10,
    },
});

export default Checklist;