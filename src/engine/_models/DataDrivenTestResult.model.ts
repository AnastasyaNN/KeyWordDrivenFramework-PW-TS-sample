import {TestStepResult} from "./TestStepResult.model";
import {TestData} from "./TestData.model";

export interface DataDrivenTestResult {
    testName: string;
    testData: TestData;
    passed: boolean;
    error?: string;
    steps: TestStepResult[];
}