import {TestStepResult} from "./TestStepResult.model";

export interface TestResult {
    testCase: string,
    passed: boolean;
    steps: TestStepResult[];
}