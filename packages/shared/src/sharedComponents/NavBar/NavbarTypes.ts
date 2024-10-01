import { Animated } from 'react-native';

export interface NavItem {
    label: string;
    onPress: () => void;
}

export interface MobileNavbarProps {
    items: NavItem[];
    activeIndex: number;
    title: string;
    onBackPress?: () => void;
    showFilter?: boolean;
    onFilterPress?: () => void;
    quickButtonFunction?: () => void;
    screen?: string;
}
