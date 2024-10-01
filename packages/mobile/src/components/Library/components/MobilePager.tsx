import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';

interface MobilePagerProps {
    initialPage: number;
    onPageSelected: (e: { nativeEvent: { position: number } }) => void;
    style?: any;
    children: React.ReactNode[];
}

const MobilePager = forwardRef<{ setPage: (index: number) => void }, MobilePagerProps>(({ 
    children, 
    initialPage, 
    onPageSelected, 
    style 
}, ref) => {
    useImperativeHandle(ref, () => ({
        setPage: (index: number) => {
            if (pagerRef.current) {
                pagerRef.current.setPage(index);
            }
        }
    }));

    const pagerRef = React.useRef<PagerView>(null);

    return (
        <PagerView
            ref={pagerRef}
            style={[styles.container, style]}
            initialPage={initialPage}
            onPageSelected={onPageSelected}
        >
            {children}
        </PagerView>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default MobilePager;