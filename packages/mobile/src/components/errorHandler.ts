// errorHandler.js
import { Alert } from 'react-native';

const globalErrorHandler = (error: any, isFatal: any) => {
    if (isFatal) {
        Alert.alert(
        'Unexpected error occurred',
        `
        Error: ${isFatal ? 'Fatal:' : ''} ${error.name} ${error.message}
        We have reported this to our team! Please close the app and start again!
        `,
        [
            {
            text: 'Close',
            onPress: () => {
                // Optionally, close the app
            },
            },
        ],
        );
    } else {
        console.log(error); // So that we can see it in the console
    }
};

export default globalErrorHandler;
