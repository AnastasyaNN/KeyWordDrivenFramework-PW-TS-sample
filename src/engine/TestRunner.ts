import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import _ from 'lodash';
import { PlaywrightController } from './PlaywrightController';
import {KeywordRegistry} from "./KeywordRegistry";
import { AllureV3 } from "../reporting/allure-v3";
import { ContentType } from "allure-js-commons";
import {TestStep} from "./_models/TestStep.model";
import {TestResult} from "./_models/TestResult.model";
import {TestStepResult} from "./_models/TestStepResult.model";
import {DataDrivenEngine, DDT_STEP_PLACEHOLDER} from "./DataDrivenEngine"
import {TestCase} from "./_models/TestCase.model";

export class TestRunner {
    private keywordRegistry: KeywordRegistry;
    private readonly playwrightController: PlaywrightController;
    private readonly allure: AllureV3;
    private dataDrivenEngine: DataDrivenEngine;

    constructor() {
        this.playwrightController = new PlaywrightController();
        this.allure = new AllureV3();
        this.dataDrivenEngine = new DataDrivenEngine();
    }

    async initialize() {
        await this.playwrightController.launchBrowser();
        this.keywordRegistry = new KeywordRegistry(this.playwrightController);
    }

    async shutdown() {
        await this.playwrightController.closeBrowser();
    }

    async runTests(testFile: string, workerIndex = 0, workerCount = 1): Promise<TestResult[]> {
        const testPath = path.join(__dirname, '../tests/scenarios', testFile);
        const testCases = await this.getDataDrivenTestCases(this.parseTestFile(testPath));
        const suiteName = path.basename(testFile, path.extname(testFile));

        this.allure.setDefaultSuite(`${suiteName}#w${workerIndex}`);

        const testResults: Array<TestResult> = [];

        for (const id in testCases) {
            if (+id % workerCount !== workerIndex) continue;
            const testCase = testCases[id];
            const testResult = await this.runTest(testCase.testSteps, `${testCase.testCaseId}-${testCase.testCase}`, suiteName)
            testResults.push(testResult);
        }
        return testResults;
    }

    private async runTest(testSteps: TestStep[], testCase: string, suiteName: string): Promise<TestResult> {
        const results: TestStepResult[] = [];

        // Запускаем Allure test
        this.allure.startTest(testCase, suiteName);
        testSteps.filter(step => step.testData && step.value).forEach(step => {
            this.allure.parameter(step.value, step.testData)
        })

        for (const [index, step] of testSteps.entries()) {
            const title = step.description
                ?? `${step.keyword}${step.object ? " " + step.object : ""}${step.testData || step.value ? " = " + step.testData || step.value : ""}`;

            try {
                await this.allure.step(title, async () => {
                    await this.keywordRegistry.executeKeyword(step.keyword, step.object, step.testData || step.value);
                });

                results.push({
                    step: index + 1,
                    status: "passed",
                    keyword: step.keyword,
                    message: step.description
                });

            } catch (error) {
                // делаем скриншот, если шаг упал
                let shot: string | undefined;
                try {
                    shot = await this.playwrightController.takeScreenshot(
                        `${suiteName}-${testCase}-step${index + 1}`
                    );
                } catch { /* игнорируем */ }

                if (shot) {
                    await this.allure.attachToTest("Screenshot on failure", shot, ContentType.PNG);
                }

                this.allure.failTest(error);
                results.push({
                    step: index + 1,
                    status: "failed",
                    keyword: step.keyword,
                    message: `Ошибка: ${JSON.stringify(error)}`
                });
                return { testCase, passed: false, steps: results };
            }
        }

        // сценарий выполнился успешно, если мы здесь
        this.allure.passTest();
        return { testCase, passed: true, steps: results };
    }

    private parseTestFile(filePath: string): Array<TestCase> {
        const TEST_CASE_COLUMN_TITLE = 'Сценарий',
            KEYWORD_COLUMN_TITLE = 'Ключевое слово',
            OBJECT_COLUMN_TITLE = 'Объект',
            VALUE_COLUMN_TITLE = 'Значение',
            DESCRIPTION_COLUMN_TITLE = 'Описание';

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        });

        const testCasesRecords = records.map((record: any) => ({
            testCaseId: record.id.trim(),
            testCase: record[TEST_CASE_COLUMN_TITLE].trim(),
            keyword: record[KEYWORD_COLUMN_TITLE].trim(),
            object: record[OBJECT_COLUMN_TITLE]?.trim(),
            value: record[VALUE_COLUMN_TITLE]?.trim(),
            description: record[DESCRIPTION_COLUMN_TITLE]?.trim()
        }));

        const groupedData = _.groupBy(testCasesRecords, 'testCaseId');

        let testCasesResult: Array<TestCase> = [];
        Object.values(groupedData).forEach(value => {
            testCasesResult.push({
                testCaseId: value[0].testCaseId,
                testCase: value[0].testCase,
                testSteps: value.map(el => {
                    return {
                        keyword: el.keyword,
                        object: el.object,
                        value: el.value,
                        description: el.description
                    }
                })
            })
        })
        return testCasesResult
    }

    private async getDataDrivenTestCases(testCases: Array<TestCase>): Promise<Array<TestCase>> {
        const that = this;
        let resultTestCases: Array<TestCase> = [];
        for (const tc of testCases) {
            if (that.isDataDrivenTestCases(tc)) {
                const dataDrivenTestCases = await that.dataDrivenEngine.generateDataDrivenTests(tc)
                resultTestCases = resultTestCases.concat(dataDrivenTestCases)
            } else {
                resultTestCases.push(tc)
            }
        }
        return resultTestCases
    }

    private isDataDrivenTestCases(testCase: TestCase) {
        return testCase.testSteps.filter(ts => ts.value?.match(DDT_STEP_PLACEHOLDER)).length > 0
    }
}
