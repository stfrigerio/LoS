// Libraries
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Dimensions } from 'react-native';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

// Components
import AppSettingRow from './atoms/AppSettingRow';
import { PickerInput } from '../../modals/components/FormComponents';

import { UseSettingsType } from './types/DailyNote';
import { UserSettingData } from '../../../types/UserSettings';

let useSettings: UseSettingsType;
if (Platform.OS === 'web') {
	useSettings = require('@los/desktop/src/components/UserSettings/hooks/useSettings').useSettings;
} else {
	useSettings = require('@los/mobile/src/components/UserSettings/hooks/useSettings').useSettings;
}

const GeneralSettings: React.FC = () => {
	const { themeColors, designs } = useThemeStyles();
	const styles = getStyles(themeColors, designs);

	const { settings, updateSetting, fetchSettings } = useSettings();
	useEffect(() => {
		fetchSettings();
	}, [fetchSettings]);

	const handleDefaultViewChange = (value: string) => {
		const setting = settings['RightPanelView'];
		const uuid = setting?.uuid || '';

		const newHabit: UserSettingData = {
			uuid: uuid,
			settingKey: 'RightPanelView',
			value: value,
			type: 'appSettings',
		};

		updateSetting(newHabit);
	};

	return (
		<View style={styles.container}>
			<ScrollView 
				style={styles.scrollView}
				contentContainerStyle={styles.scrollViewContent}
			>
				<Text style={{ color: 'gray' }}>
					Activate or deactivate sections of the app
					Restart to see the changes applied
				</Text>
				<AppSettingRow
					settingKey="HidePeople"
					label="👤 Hide People"
					type="appSettings"
					settings={settings}
					updateSetting={updateSetting}
					explainerText=""
				/>
				<AppSettingRow
					settingKey="HideTasks"
					label="✅ Hide Tasks"
					type="appSettings"
					settings={settings}
					updateSetting={updateSetting}
					explainerText=""
				/>
				<AppSettingRow
					settingKey="HideJournal"
					label="📝 Hide Journal"
					type="appSettings"
					settings={settings}
					updateSetting={updateSetting}
					explainerText=""
				/>
				<AppSettingRow
					settingKey="HideMoods"
					label="💭 Hide Moods"
					type="appSettings"
					settings={settings}
					updateSetting={updateSetting}
					explainerText=""
				/>
				<AppSettingRow
					settingKey="HideLibrary"
					label="📚 Hide Library"
					type="appSettings"
					settings={settings}
					updateSetting={updateSetting}
					explainerText=""
				/>
				<AppSettingRow
					settingKey="HideMoney"
					label="💸 Hide Money"
					type="appSettings"
					settings={settings}
					updateSetting={updateSetting}
					explainerText=""
				/>
				<AppSettingRow
					settingKey="HideTime"
					label="🕒 Hide Time"
					type="appSettings"
					settings={settings}
					updateSetting={updateSetting}
					explainerText=""
				/>
				<AppSettingRow
					settingKey="HideMusic"
					label="🎧 Hide Music"
					type="appSettings"
					settings={settings}
					updateSetting={updateSetting}
					explainerText=""
				/>
				<AppSettingRow
					settingKey="HideCarLocation"
					label="🚗 Hide Car Location"
					type="appSettings"
					settings={settings}
					updateSetting={updateSetting}
					explainerText=""
				/>
				<View style={{height: 40}} />
				<Text style={{ color: 'gray' }}>
					Further customization of the homepage
				</Text>
				<AppSettingRow
					settingKey="HideNextTask"
					label="Hide Next Task"
					type="appSettings"
					settings={settings}
					updateSetting={updateSetting}
					explainerText="Toggle the next task in the homepage objective section"
				/>
				<AppSettingRow
					settingKey="HideDots"
					label="Hide Dots"
					type="appSettings"
					settings={settings}
					updateSetting={updateSetting}
					explainerText="Toggle the dots below the calendar that show which days you have filled the daily note"
				/>
				<AppSettingRow
					settingKey="HideNextObjective"
					label="Hide Next Objective"
					type="appSettings"
					settings={settings}
					updateSetting={updateSetting}
					explainerText="Toggle the next objective section in the bottom of the homepage"
				/>
				<View style={{height: 50}} />
				<PickerInput
					label="Right Panel default view"
					selectedValue={settings.RightPanelView?.value || 'DailyNote'}
					onValueChange={handleDefaultViewChange}
					items={[
						{ label: 'Daily Note', value: 'DailyNote' },
						{ label: 'Weekly Note', value: 'WeeklyNote' },
						{ label: 'Money', value: 'Money' },
						{ label: 'Task', value: 'Task' },
					]}
				/>
			</ScrollView>
		</View>
	);
};

const getStyles = (theme: any, designs: any) => {
	const { width, height } = Dimensions.get('window');
	const isDesktop = width > 768;

	return StyleSheet.create({
		container: {
			flex: 1,
			padding: 20,
			marginTop: 10,
		},
		sectionHeader: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 10,
		},
		buttonContainer: {
			alignItems: 'center',
			marginTop: 20,
		},
		addButton: {
			...designs.button.marzoSecondary,
			width: isDesktop ? '50%' : '90%',
			alignItems: 'center',
			justifyContent: 'center',
			marginBottom: 40,
		},
		buttonText: designs.button.buttonText,
		arrow: {
			fontSize: designs.text.title.fontSize,
			color: theme.textColor,
			transform: [{ rotate: '0deg' }],
			marginBottom: 15
		},
		arrowExpanded: {
			transform: [{ rotate: '180deg' }],
			marginBottom: 0
		},
		habitRow: {
			flexDirection: 'row',
			alignItems: 'center',
		},
		subheaderStyle: {
			marginLeft: 20,
		},
		subheaderText: {
			fontSize: designs.text.title.fontSize * 0.8, // 80% of the original size
		},
		subheaderArrow: {
			fontSize: designs.text.title.fontSize * 0.8, // 80% of the original size
		},
		scrollView: {
			flex: 1,
		},
		scrollViewContent: {
			padding: 20,
			paddingBottom: 100, // Extra padding at the bottom
		},
		bottomPadding: {
			height: 60, // Adjust this value based on your GluedQuickbutton height
		},
		quickButtonContainer: {
			position: 'absolute',
			bottom: 0,
			left: 0,
			right: 0,
		},
	});
};

export default GeneralSettings;