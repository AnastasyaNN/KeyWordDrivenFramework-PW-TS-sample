import {TestStep} from "./TestStep.model";

export interface TestCase {
    testCaseId: string,
    testCase: string,
    testSteps: Array<TestStep>
}