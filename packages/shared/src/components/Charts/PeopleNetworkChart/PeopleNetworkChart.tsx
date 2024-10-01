import React, { useRef, useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, Text, Defs, RadialGradient, Stop, G } from 'react-native-svg';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

interface PersonNode {
    id: number;
    name: string;
    contacts: number;
}

interface PersonalNetworkChartProps {
    data: PersonNode[];
}

const PersonalNetworkChart: React.FC<PersonalNetworkChartProps> = ({ data }) => {
    const { themeColors, designs } = useThemeStyles();

    const width = 300;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const minDistance = 50;
    const maxDistance = 120;
    const tiltAngle = Math.PI / 4; // 6 = 30 degrees tilt, 

    const nodes = useMemo(() => {
        const maxContacts = Math.max(...data.map(n => n.contacts));
        return data.map((node, index) => {
            if (index === 0) {
                return { ...node, x: centerX, y: centerY, z: 0, distance: 0 };
            }
            const angle = (index / (data.length - 1)) * 2 * Math.PI;
            const normalizedContacts = Math.log(node.contacts + 1) / Math.log(maxContacts + 1);
            const distance = minDistance + (maxDistance - minDistance) * (1 - normalizedContacts);
            const x = distance * Math.cos(angle);
            const z = distance * Math.sin(angle);
            return {
                ...node,
                x: centerX + x,
                y: centerY + z * Math.sin(tiltAngle),
                z: z * Math.cos(tiltAngle),
                distance: distance
            };
        });
    }, []);

    const orbits = useMemo(() => {
        const uniqueDistances = [...new Set(nodes.slice(1).map(n => Math.round(n.distance)))];
        return uniqueDistances.sort((a, b) => a - b);
    }, [nodes]);

    return (
        <View style={{ 
                width, 
                height, 
                marginTop: 10,
                marginHorizontal: 10,
                backgroundColor: 'rgba(0, 0, 15, 1)', 
                borderRadius: 10, 
                borderWidth: 1, 
                borderColor: themeColors.borderColor 
            }}
        >
            <Svg width="100%" height="100%">
                <Defs>
                    <RadialGradient id="sunGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <Stop offset="0%" stopColor="#ffd700" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#ff8c00" stopOpacity="1" />
                    </RadialGradient>
                    <RadialGradient id="planetGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <Stop offset="0%" stopColor="#4682B4" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#1e3a5f" stopOpacity="1" />
                    </RadialGradient>
                </Defs>

                {/* Stars background */}
                {Array.from({ length: 50 }).map((_, i) => (
                    <Circle
                        key={`star-${i}`}
                        cx={Math.random() * width}
                        cy={Math.random() * height}
                        r={Math.random() * 0.8 + 0.2}
                        fill="#fff"
                        opacity={Math.random() * 0.4 + 0.2}
                    />
                ))}

                {/* Orbits */}
                {orbits.map((orbit, index) => (
                    <Ellipse
                        key={`orbit-${index}`}
                        cx={centerX}
                        cy={centerY}
                        rx={orbit}
                        ry={orbit * Math.sin(tiltAngle)}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="0.5"
                    />
                ))}

                {/* Nodes */}
                {nodes.map((node, index) => {
                    const nodeSize = node.id === 0 ? 12 : 6 - (node.distance - minDistance) / (maxDistance - minDistance) * 2;
                    const opacity = node.id === 0 ? 1 : 0.7 + (maxDistance - node.distance) / (maxDistance - minDistance) * 0.3;
                    return (
                        <G key={index}>
                            <Circle
                                cx={node.x}
                                cy={node.y}
                                r={nodeSize}
                                fill={node.id === 0 ? "url(#sunGradient)" : "url(#planetGradient)"}
                                opacity={opacity}
                            />
                            {node.id !== 0 && (
                                <Circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={nodeSize}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.3)"
                                    strokeWidth="0.5"
                                />
                            )}
                            <Text
                                x={node.x}
                                y={node.y + nodeSize + 6}
                                fontSize="8"
                                textAnchor="middle"
                                fill={themeColors.textColor}
                            >
                                {node.name}
                            </Text>
                        </G>
                    );
                })}
            </Svg>
        </View>
    );
};

export default PersonalNetworkChart;