import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';

interface DesktopPagerProps {
    initialPage: number;
    onPageSelected: (e: { nativeEvent: { position: number } }) => void;
    style?: any;
    children: React.ReactNode[];
}
//todo this stupid shit doesnt work since the children are passed in a weird way that i do not understand
const DesktopPager = forwardRef<{ setPage: (index: number) => void }, DesktopPagerProps>(({ 
    children, 
    initialPage, 
    onPageSelected, 
    style 
}, ref) => {
    const [currentPage, setCurrentPage] = useState(initialPage);

    useImperativeHandle(ref, () => ({
        setPage: (index: number) => {
            setCurrentPage(index);
        }
    }));

    useEffect(() => {
        onPageSelected({ nativeEvent: { position: currentPage } });
    }, [currentPage, onPageSelected]);

    return (
        <View style={[styles.container, style]}>
            {React.Children.map(children, (child, index) => (
                <View 
                    key={index}
                    style={[
                        styles.page, 
                        { display: index === currentPage ? 'flex' : 'none' }
                    ]}
                >
                    {child}
                </View>
            ))}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    page: {
        flex: 1,
    },
});

export default DesktopPager;