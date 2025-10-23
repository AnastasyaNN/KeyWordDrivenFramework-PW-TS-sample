export interface TestStepResult {
    step: number;
    status: 'passed' | 'failed';
    keyword: string;
    message?: string;
}