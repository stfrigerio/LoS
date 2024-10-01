import React, { useRef, useState, useEffect } from 'react';
import { Pressable, View, Animated, Text, StyleSheet, Easing } from 'react-native';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { useNavbarDrawer } from '@los/shared/src/components/Contexts/NavbarContext';

interface DrawerContentProps {
    items: { label: string; onPress: () => void }[];
    activeIndex: number;
}

const DrawerContent: React.FC<DrawerContentProps> = ({ items, activeIndex }) => {
    const { themeColors } = useThemeStyles();
    const styles = getStyles(themeColors);
    const { isOpen, toggleDrawer } = useNavbarDrawer();

    const [fadeAnims, setFadeAnims] = useState<Animated.Value[]>([]);
    const animsRef = useRef<Animated.Value[]>([]);

    useEffect(() => {
        if (items.length !== fadeAnims.length) {
            const newAnims = items.map(() => new Animated.Value(0));
            setFadeAnims(newAnims);
            animsRef.current = newAnims;
        }
    }, [items, fadeAnims.length]);

    useEffect(() => {
        if (fadeAnims.length === 0) return;

        const animations = Animated.stagger(
            80,
            fadeAnims.map((anim) =>
                Animated.timing(anim, {
                    toValue: isOpen ? 1 : 0,
                    duration: 200,
                    useNativeDriver: true,
                })
            ).reverse()
        );

        animations.start();

        return () => {
            animations.stop();
            fadeAnims.forEach((anim) => anim.setValue(0));
        };
    }, [isOpen, fadeAnims]);

    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

    const handleItemPress = (index: number) => {
        items[index].onPress();
        toggleDrawer();
    };

    return (
        <>
            {isOpen && (
                <View style={styles.drawerContainer}>
                    <View style={styles.drawer}>
                        {items.map((item, index) => (
                            <Animated.View
                                key={item.label}
                                style={{ opacity: fadeAnims[index] }}
                            >
                                <AnimatedPressable
                                    style={[
                                        styles.drawerItem, 
                                        activeIndex === index && styles.activeDrawerItem,
                                        { opacity: fadeAnims[index] },
                                    ]}
                                    onPress={() => {
                                        handleItemPress(index);
                                        toggleDrawer();
                                    }}
                                >
                                    <Text style={styles.drawerItemText}>{item.label}</Text>
                                </AnimatedPressable>
                            </Animated.View>
                        ))}
                    </View>
                </View>
            )}
        </>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    drawerContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 10,
        zIndex: 1000,
    },
    drawer: {
        position: 'absolute',
        left: 0,
        bottom: 60,
        width: 150,
        borderWidth: 1,
        borderColor: theme.borderColor,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        marginHorizontal: 10,
        borderRadius: 20,
        paddingLeft: 10,
        paddingTop: 8,
    },
    drawerItem: {
        padding: 10,
        backgroundColor: 'rgba(227, 142, 148, 1)',
        marginBottom: 8,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%'
    },
    activeDrawerItem: {
        backgroundColor: theme.hoverColor,
    },
    drawerItemText: {
        color: '#1E2225',
        fontSize: 14,
    },
});

export default DrawerContent;