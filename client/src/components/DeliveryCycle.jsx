import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
    { key: 'pending', label: 'PLACED' },
    { key: 'processing', label: 'CONFIRMED' },
    { key: 'shipped', label: 'SHIPPED' },
    { key: 'completed', label: 'DELIVERED' }
];

const STATUS_ORDER = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];

const getStepIndex = (status) => {
    const idx = STATUS_ORDER.indexOf(status);
    if (idx === -1 || status === 'cancelled') return 0;
    return Math.min(idx, 3);
};

const DeliveryCycle = ({ status, editable, onStatusChange, saving }) => {
    const currentStep = getStepIndex(status || 'pending');
    const isCancelled = status === 'cancelled';

    return (
        <div className="py-4">
            <div className="flex items-center justify-between gap-1 sm:gap-2 flex-wrap">
                {STEPS.map((step, index) => {
                    const isCompleted = !isCancelled && index <= currentStep;

                    return (
                        <React.Fragment key={step.key}>
                            <div className="flex flex-col items-center flex-1 min-w-0">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                                        isCompleted
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                                    }`}
                                >
                                    {isCompleted ? <Check size={16} strokeWidth={3} /> : index + 1}
                                </div>
                                <span
                                    className={`text-xs font-medium mt-1 truncate max-w-[72px] text-center ${
                                        isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                                    }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div
                                    className={`flex-1 h-0.5 max-w-[32px] sm:max-w-[48px] min-w-[12px] rounded self-center mb-4 ${
                                        isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
                                    }`}
                                    aria-hidden="true"
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            {editable && onStatusChange && !isCancelled && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Update status</label>
                    <select
                        value={status || 'pending'}
                        onChange={(e) => onStatusChange(e.target.value)}
                        disabled={saving}
                        className="w-full sm:w-auto text-sm px-3 py-2 rounded-lg bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white"
                    >
                        {STEPS.map((s) => (
                            <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default DeliveryCycle;
