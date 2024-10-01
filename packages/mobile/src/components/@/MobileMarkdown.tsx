import React from 'react';
import Markdown from 'react-native-markdown-display';

interface MarkdownProps {
    children: string;
    style?: any;
}

const MobileMarkdown: React.FC<MarkdownProps> = ({ children, style }) => {
    return <Markdown style={style}>{children}</Markdown>;
};

export default MobileMarkdown;