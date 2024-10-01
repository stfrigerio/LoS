import React from 'react';
import { View, Text, Button } from 'react-native';

class ErrorBoundary extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: any) {
        // Update state so the next render shows the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: any, errorInfo: any) {
        // You can log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        // Optionally, you can add logic to reload the app or navigate to a safe screen
    };

    render() {
        if (this.state.hasError) {
        // Fallback UI
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Something went wrong.</Text>
                <Button title="Try Again" onPress={this.handleReload} />
            </View>
        );
        }

        return this.props.children; 
    }
}

export default ErrorBoundary;
