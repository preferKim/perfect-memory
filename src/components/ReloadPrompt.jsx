import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function ReloadPrompt() {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setNeedRefresh(false);
    };

    return (
        <div className="ReloadPrompt-container">
            {needRefresh && (
                <div className="fixed bottom-4 right-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[9999] flex flex-col gap-2 max-w-sm animate-fade-in-up">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                새로운 업데이트가 있습니다! ✨
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                최신 기능을 사용하려면 새로고침해주세요.
                            </p>
                        </div>
                        <button
                            onClick={close}
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button
                            className="flex-1 px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
                            onClick={() => updateServiceWorker(true)}
                        >
                            지금 새로고침
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReloadPrompt;
