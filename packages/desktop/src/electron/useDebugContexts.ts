import { useEffect } from 'react';

const useDebugContexts = (enableDebugContext: (context: string) => void) => {
    useEffect(() => {
        // Retrieve debug contexts from environment variable
        const debugContexts = window.electronEnv.REACT_APP_DEBUG_CONTEXTS ? window.electronEnv.REACT_APP_DEBUG_CONTEXTS.split(',') : [];

        // Enable each debug context
        debugContexts.forEach(context => {
            enableDebugContext(context.trim());
        });
    }, [enableDebugContext]);
};

export default useDebugContexts;
