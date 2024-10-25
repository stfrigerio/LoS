import { Platform } from 'react-native';

export const darkTheme = {
	backgroundColor: '#212121',
	backgroundSecondary: '#333232',
	textColor: '#d3c6aa',
	textColorBold: '#c79428',
	textColorItalic: '#CBA95F',
	opaqueTextColor: 'rgba(211, 198, 170, 0.5)',
	borderColor: '#333232',
	hoverColor: '#CC5359',

	red: 'rgb(250, 37, 37)',
	redOpacity: 'rgba(250, 37, 37, 0.8)',
	yellow: 'rgb(204, 197, 20)',
	yellowOpacity: 'rgba(204, 197, 20, 0.9)',
	green: 'rgb(61, 247, 52)',
	greenOpacity: 'rgba(61, 247, 52, 0.5)',
	blue: 'rgb(0, 122, 255)',
	blueOpacity: 'rgba(0, 122, 255, 0.5)',
};

export const markdownStyles = (theme) => {
	const isDesktop = Platform.OS === 'web';
	// https://github.com/iamacup/react-native-markdown-display/blob/master/src/lib/renderRules.js
	return {
		body: {
			color: theme.textColor,
		},
		heading1: {
			fontSize: 24,
			fontWeight: '700',
		},
		heading2: {
			fontSize: 20,
			fontWeight: '600',
		},
		body: {
			fontSize: 16,
			fontFamily: 'serif',
			color: theme.textColor,
		},
		blockquote: isDesktop ? {
			backgroundColor: theme.backgroundSecondary,
			borderLeftWidth: 4,
			borderLeftColor: theme.hoverColor,
			paddingLeft: 10,
			marginLeft: 10,
			marginBottom: 10,
			marginTop: 10,
			opacity: 0.8,
		} : {
			backgroundColor: theme.backgroundSecondary,
			borderColor: theme.hoverColor,
			paddingLeft: 10,
			marginLeft: 10,
			marginBottom: 10,
			opacity: 0.8,
			borderRadius: 10,
		},
		hr: {
			marginVertical: 10,
			backgroundColor: theme.borderColor,
		},
		list_item: {
			marginBottom: 5,
		},
		bullet_list: {
			marginBottom: 10,
		},
		ordered_list: {
			marginBottom: 10,
		},
		strong: {
			fontWeight: 'bold',
			color: theme.textColorBold
		},
		em: {
			fontStyle: 'italic',  
			color: theme.textColorItalic
		},
	};  
};

export const lightTheme = {
	primaryColor: '#800020',
	backgroundColor: '#fdf6e3',
	backgroundSecondary: '#efebd4',
	textColor: '#5c6a72',
	textColorBold: '#c79428',
	textColorItalic: '#CBA95F',
	borderColor: '#dee2e6',
	accentColor: '#f8f9fa',
	hoverColor: '#4a5962',
	disabledColor: '#b0b8be',

	red: 'rgb(219, 0, 0)',
	redOpacity: 'rgba(219, 0, 0, 0.6)',
	yellow: 'rgb(156, 150, 0)',
	yellowOpacity: 'rgba(156, 150, 0, 0.6)',
	green: 'rgb(8, 153, 0)',
	greenOpacity: 'rgba(8, 153, 0, 0.6)'
};

export const lightNavigationTheme = {
	...lightTheme,
	dark: false,
	colors: {
		...lightTheme,
		primary: '#800020',
		background: lightTheme.backgroundColor,
		card: lightTheme.backgroundColor,
		text: lightTheme.textColor,
		border: 'gray',
		notification: lightTheme.backgroundColor,
	},
};
	
export const darkNavigationTheme = {
	...darkTheme,
	dark: true,
	colors: {
		...darkTheme,
		primary: '#800020',
		background: darkTheme.backgroundColor,
		card: darkTheme.backgroundColor,
		text: darkTheme.textColor,
		border: 'gray',
		notification: darkTheme.backgroundColor,
	},
};

export const lightCalendar = {
	backgroundColor: 'transparent',
	calendarBackground: 'transparent',
	dayTextColor: '#5c6a72',
	textDisabledColor: '#b0b8be',
	todayTextColor: '#CBA95F',
	monthTextColor: '#CBA95F',
	arrowColor: 'gray',
	textSectionTitleColor: 'gray',
	weekVerticalMargin: 3,
}

export const darkCalendar = {
	backgroundColor: 'transparent',
	calendarBackground: 'transparent',
	dayTextColor: '#d3c6aa',
	textDisabledColor: '#3a4248',
	todayTextColor: '#CBA95F',
	monthTextColor: '#CBA95F',
	arrowColor: '#808080',
	textSectionTitleColor: '#808080',
	// weekVerticalMargin: 3,
}