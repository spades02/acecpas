
export interface Question {
    id: string;
    priority: 'high' | 'medium' | 'low';
    date: string;
    amount: string;
    vendor: string;
    category: string;
    question: string;
}

export const MOCK_QUESTIONS: Question[] = [
    {
        id: '1',
        priority: 'high',
        date: 'March 15, 2024',
        amount: '$8,450.00',
        vendor: 'Ferrari of Denver',
        category: 'Auto Expense',
        question: 'Please confirm the business purpose of this vehicle expense and provide supporting documentation (lease agreement, business use log).',
    },
    {
        id: '2',
        priority: 'medium',
        date: 'April 3, 2024',
        amount: '$2,150.00',
        vendor: 'Best Buy',
        category: 'Equipment',
        question: 'Please clarify if this equipment purchase was for business use and specify the item(s) purchased.',
    },
];
