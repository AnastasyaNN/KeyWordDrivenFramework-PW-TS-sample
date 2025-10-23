import * as _ from 'lodash';
import {DataLoader} from '../data/DataLoader';
import {TestCase} from "./_models/TestCase.model";
import {TestStep} from "./_models/TestStep.model";

export const DDT_STEP_PLACEHOLDER = /\$\{(\w+\.\w+)\}/

export class DataDrivenEngine {
    private dataLoader: DataLoader;

    constructor() {
        this.dataLoader = new DataLoader();
    }

    async generateDataDrivenTests(testCase: TestCase): Promise<Array<TestCase>> {
            return await this.prepareTestCasesWithTestData(testCase)
    }

    private async prepareTestCasesWithTestData(testCase: TestCase, resultTestCases: Array<TestCase> = []): Promise<Array<TestCase>> {
        const that = this;
        // Добавляем индексы к шагам сценария и группируем шаги по placeholder
        const testCaseWithIndexedTestSteps = this.addIndexesToTestSteps(testCase)
        const stepsWithPlaceholdersWithoutTestDataGroupedByValue =
            this.groupTestStepsByPlaceholder(testCaseWithIndexedTestSteps)
        // Выходим из рекурсии, если нет placeholder'ов
        if (_.keys(stepsWithPlaceholdersWithoutTestDataGroupedByValue).length === 0) {
            resultTestCases.push(testCaseWithIndexedTestSteps)
            return resultTestCases
        }

        // Для первого найденного placeholder загружаем данные, инициализируем тестовые данные
        // и вызываем prepareTestCasesWithTestData с инициализированными данными для текущего placeholder.
        // Остальные placeholder'ы обработаем в следующих вызовах prepareTestCasesWithTestData
        const placeholder = _.keys(stepsWithPlaceholdersWithoutTestDataGroupedByValue)[0]
        const testData = await this.loadDataForPlaceholder(placeholder);
        if (!Array.isArray(testData)) {
            throw new Error('Данные должны быть массивом');
        }

        for (const data of testData) {
            let currentTestCase = _.cloneDeep(testCaseWithIndexedTestSteps)
            currentTestCase = that.getTestCaseWithInitializedTestData(
                _.cloneDeep(testCaseWithIndexedTestSteps),
                stepsWithPlaceholdersWithoutTestDataGroupedByValue,
                placeholder,
                data
            )
            resultTestCases.concat(await that.prepareTestCasesWithTestData(currentTestCase, resultTestCases))
        }
        return resultTestCases
    }

    private addIndexesToTestSteps(testCase: TestCase): TestCase {
        return {
            ...testCase,
            testSteps: testCase.testSteps.map((el, id) => {
                    return {...el, id: id}
                }
            )
        }
    }

    private groupTestStepsByPlaceholder(testCase: TestCase) {
        const testCaseWithIndexedTestSteps = this.addIndexesToTestSteps(testCase)
        const stepsWithPlaceholderWithoutTestData = testCaseWithIndexedTestSteps.testSteps
            .filter(step => step.value && step.value.match(DDT_STEP_PLACEHOLDER) && !step.testData);
        return _.groupBy(stepsWithPlaceholderWithoutTestData, 'value')
    }

    private async loadDataForPlaceholder(placeholder: string) {
        const matchResult = placeholder.match(DDT_STEP_PLACEHOLDER)
        if (matchResult) return await this.dataLoader.loadData(matchResult[1])
        return undefined
    }

    private getTestCaseWithInitializedTestData(
        currentTestCase: TestCase,
        stepsWithPlaceholdersWithoutTestDataGroupedByValue: any,
        placeholder: string,
        data: any): TestCase {
        (stepsWithPlaceholdersWithoutTestDataGroupedByValue[placeholder] as Array<TestStep>).forEach(step => {
            const stepWithTheSameId = currentTestCase.testSteps.find(el => el.id === step.id)
            if (stepWithTheSameId) {
                stepWithTheSameId.testData = data
            }
        })
        currentTestCase.testSteps.map(el => {
            if (el.id != undefined) { // @ts-ignore
                delete el.id
            }
        })
        return currentTestCase
    }
}