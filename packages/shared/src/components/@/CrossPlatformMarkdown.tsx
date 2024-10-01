import React from 'react';
import { Platform } from 'react-native';

let Markdown: React.ComponentType<any>;

if (Platform.OS === 'web') {
    Markdown = require('@los/desktop/src/components/@/DesktopMarkdown').default;
} else {
    Markdown = require('@los/mobile/src/components/@/MobileMarkdown').default;
}

interface MarkdownProps {
    children: string;
    style?: any; // Adjust this type as needed
}

const CrossPlatformMarkdown: React.FC<MarkdownProps> = ({ children, style }) => {
    return <Markdown style={style}>{children}</Markdown>;
};

export default CrossPlatformMarkdown;