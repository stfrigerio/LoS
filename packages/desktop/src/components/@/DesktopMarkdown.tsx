import React from 'react';
import { Text, View } from 'react-native';

interface SimpleWebMarkdownProps {
    children: string;
    style?: any;
}

const SimpleWebMarkdown: React.FC<SimpleWebMarkdownProps> = ({ children, style }) => {
    const lines = children.split('\n');

    const parseInlineStyles = (text: string) => {
        const parts = [];
        let currentText = '';
        let isBold = false;
        let isItalic = false;

        for (let i = 0; i < text.length; i++) {
            if (text[i] === '*' || text[i] === '_') {
                if (i + 1 < text.length && text[i + 1] === text[i]) {
                    // Bold
                    if (currentText) parts.push({ text: currentText, bold: isBold, italic: isItalic });
                    currentText = '';
                    isBold = !isBold;
                    i++; // Skip next asterisk
                } else {
                    // Italic
                    if (currentText) parts.push({ text: currentText, bold: isBold, italic: isItalic });
                    currentText = '';
                    isItalic = !isItalic;
                }
            } else {
                currentText += text[i];
            }
        }

        if (currentText) parts.push({ text: currentText, bold: isBold, italic: isItalic });

        return parts.map((part, index) => (
            <Text key={index} style={[
                style?.body,
                part.bold && style?.strong,
                part.italic && style?.em
            ]}>
                {part.text}
            </Text>
        ));
    };

    const renderLine = (line: string, index: number) => {
        if (line.trim() === '') {
            // Render empty lines as a space to preserve whitespace
            return <Text key={index} style={style?.body}>{'\n'}</Text>;
        } else if (line.startsWith('# ')) {
            return <Text key={index} style={style?.heading1}>{parseInlineStyles(line.slice(2))}</Text>;
        } else if (line.startsWith('## ')) {
            return <Text key={index} style={style?.heading2}>{parseInlineStyles(line.slice(3))}</Text>;
        } else if (line.startsWith('> ')) {
            return (
                <View key={index} style={style?.blockquote}>
                    <Text style={style?.body}>{parseInlineStyles(line.slice(2))}</Text>
                </View>
            );
        } else if (line.trim().startsWith('- ')) {
            return (
                <View key={index} style={style?.list_item}>
                    <Text style={style?.body}>• {parseInlineStyles(line.slice(2))}</Text>
                </View>
            );
        } else {
            return <Text key={index} style={style?.body}>{parseInlineStyles(line)}</Text>;
        }
    };

    return (
        <View style={style?.body}>
            {lines.map(renderLine)}
        </View>
    );
};

export default SimpleWebMarkdown;