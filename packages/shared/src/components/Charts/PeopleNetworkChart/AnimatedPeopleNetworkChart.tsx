import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Platform } from 'react-native';
import Svg, { Circle, Ellipse, Text, Defs, RadialGradient, Stop, G } from 'react-native-svg';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

let Slider: any;
if (Platform.OS === 'web') {
    Slider = null
} else {
    Slider = require('./components/Slider').default;
}

interface PersonNode {
    id: number;
    name: string;
    contacts: number;
}

interface ProcessedPersonNode extends PersonNode {
    angle: number;
    distance: number;
}

interface PersonalNetworkChartProps {
    data: PersonNode[];
}

const PersonalNetworkChart: React.FC<PersonalNetworkChartProps> = ({ data }) => {
    const { themeColors, designs } = useThemeStyles();
    const [rotation, setRotation] = useState(0);
    const [starOffset, setStarOffset] = useState(0);
    const [visibleNodes, setVisibleNodes] = useState(data.length); // Add this state

    const width = 300;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const minDistance = 50;
    const maxDistance = 200;
    const tiltAngle = Math.PI / 6;

    const nodes = useMemo<ProcessedPersonNode[]>(() => {
        const maxContacts = Math.max(...data.map(n => n.contacts));
        return data
            .map((node, index) => {
                if (index === 0) {
                    return { ...node, distance: 0, angle: 0 };
                }
                const angle = (index / (data.length - 1)) * 2 * Math.PI;
                const normalizedContacts = Math.log(node.contacts + 1) / Math.log(maxContacts + 1);
                const distance = minDistance + (maxDistance - minDistance) * (1 - normalizedContacts);
                return { ...node, distance, angle };
            })
            .sort((a, b) => a.distance - b.distance); // Sort nodes by distance
    }, [data]);

    const orbits = useMemo(() => {
        const uniqueDistances = [...new Set(nodes.slice(1).map(n => Math.round(n.distance)))];
        return uniqueDistances.sort((a, b) => a - b);
    }, [nodes]);

    const stars = useMemo(() => {
        return Array.from({ length: 50 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 0.8 + 0.2,
            opacity: Math.random() * 0.4 + 0.2
        }));
    }, []);

    const animate = useCallback((time: number) => {
        setRotation(prev => (prev + 0.020) % (2 * Math.PI));
        setStarOffset(prev => (prev + 0.5) % width);
        requestAnimationFrame(animate);
    }, [width]);

    useEffect(() => {
        const animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, [animate]);

    const getNodePosition = useCallback((node: ProcessedPersonNode) => {
        if (node.id === 0) return { x: centerX, y: centerY };
        const angle = node.angle + rotation;
        const x = centerX + node.distance * Math.cos(angle);
        const z = node.distance * Math.sin(angle);
        return {
            x,
            y: centerY + z * Math.sin(tiltAngle)
        };
    }, [rotation, centerX, centerY, tiltAngle]);

    const visibleNodesData = useMemo(() => {
        return [nodes[0], ...nodes.slice(1, visibleNodes)];
    }, [nodes, visibleNodes]);

    return (
        <View>
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
                    <G x={-starOffset}>
                        {stars.map((star, i) => (
                            <Circle
                                key={`star-${i}`}
                                cx={star.x}
                                cy={star.y}
                                r={star.size}
                                fill="#fff"
                                opacity={star.opacity}
                            />
                        ))}
                        {stars.map((star, i) => (
                            <Circle
                                key={`star-right-${i}`}
                                cx={star.x + width}
                                cy={star.y}
                                r={star.size}
                                fill="#fff"
                                opacity={star.opacity}
                            />
                        ))}
                    </G>

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
                    {visibleNodesData.map((node, index) => {
                        const { x, y } = getNodePosition(node);
                        const nodeSize = node.id === 0 ? 12 : 6 - (node.distance - minDistance) / (maxDistance - minDistance) * 2;
                        const opacity = node.id === 0 ? 1 : 0.7 + (maxDistance - node.distance) / (maxDistance - minDistance) * 0.3;
                        return (
                            <G key={index}>
                                <Circle
                                    cx={x}
                                    cy={y}
                                    r={nodeSize}
                                    fill={node.id === 0 ? "url(#sunGradient)" : "url(#planetGradient)"}
                                    opacity={opacity}
                                />
                                {node.id !== 0 && (
                                    <Circle
                                        cx={x}
                                        cy={y}
                                        r={nodeSize}
                                        fill="none"
                                        stroke="rgba(255,255,255,0.3)"
                                        strokeWidth="0.5"
                                    />
                                )}
                                <Text
                                    x={x}
                                    y={y + nodeSize + 6}
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
            {Slider && <Slider data={data} visibleNodes={visibleNodes} setVisibleNodes={setVisibleNodes} />}
        </View>
    );
};

export default PersonalNetworkChart;