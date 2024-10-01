import React from 'react';
import { View, Text, TextInput, StyleSheet, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

interface FormInputProps {
    label: string;
    value: string;
    onChangeText?: (value: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    multiline?: boolean;
    isNumeric?: boolean;
    editable?: boolean;
}

interface PickerInputProps {
    label: string;
    selectedValue: string;
    onValueChange: (itemValue: string) => void;
    items: Array<{ label: string; value: string }>;
}

interface SwitchInputProps {
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    trueLabel?: string;
    falseLabel?: string;
    trackColorFalse?: string;
    trackColorTrue?: string;
    leftLabelOff?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({ label, value, isNumeric = false, onChangeText, editable = true, ...props }) => {
    const { designs } = useThemeStyles();
    const styles = getStyles(useThemeStyles().themeColors);

    return (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput
                style={designs.text.input}
                placeholderTextColor='gray'
                keyboardType={isNumeric ? 'numeric' : props.keyboardType}
                onChangeText={onChangeText}
                value={value}
                editable={editable}
                {...props}
            />
        </View>
    );
};

export const PickerInput: React.FC<PickerInputProps> = ({ label, items, ...props }) => {
    const { themeColors } = useThemeStyles();
    const styles = getStyles(themeColors);
    return (
        <View style={styles.inputContainer}>
            <Text style={styles.pickerLabel}>{label}</Text>
            <Picker
                style={styles.picker}
                dropdownIconColor={themeColors.textColor}
                mode="dropdown"
                {...props}
            >
                {items.map(item => (
                    <Picker.Item key={item.value} label={item.label} value={item.value} style={styles.pickerItemStyle}/>
                ))}
            </Picker>
        </View>
    );
};

export const SwitchInput: React.FC<SwitchInputProps> = ({ 
    value, 
    onValueChange, 
    trueLabel = 'On', 
    falseLabel = 'Off',
    trackColorFalse,
    trackColorTrue,
    leftLabelOff = false
}) => {
    const { themeColors } = useThemeStyles();
    const styles = getStyles(themeColors);

    return (
        <View style={styles.switchContainer}>
            <View style={styles.switchWrapper}>
                {!leftLabelOff && (
                    falseLabel ? (
                        <Text style={[styles.switchLabel, !value && styles.activeSwitchLabel]}>{falseLabel}</Text>
                    ) : (
                        <View style={styles.emptyLabel} />
                    )
                )}
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: trackColorFalse, true: trackColorTrue }}
                    thumbColor={themeColors.backgroundSecondary}
                />
                <Text style={[
                    styles.switchLabel, 
                    value && styles.activeSwitchLabel,
                    leftLabelOff && styles.fullWidthLabel
                ]}>
                    {trueLabel}
                </Text>
            </View>
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    inputContainer: {
        marginBottom: 5,
        minWidth: '100%',
    },
    inputLabel: {
        color: 'gray',
        marginLeft: 5,
        marginBottom: 2,
    },
    picker: {
        height: 50,
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
    },
    pickerLabel: {
        color: 'gray',
        marginLeft: 5,
        marginBottom: 0,
    },
    pickerItemStyle: {
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontSize: 16,
    },
    switchContainer: {
        width: '100%',
        marginBottom: 10,
    },
    switchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: theme.backgroundColor,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    switchLabel: {
        flex: 1,
        color: 'gray',
        opacity: 0.6,
        fontSize: 14,
    },
    activeSwitchLabel: {
        opacity: 1,
    },
    emptyLabel: {
        flex: 1,
    },
    fullWidthLabel: {
        flex: 1,
        marginLeft: 10,
    },
});