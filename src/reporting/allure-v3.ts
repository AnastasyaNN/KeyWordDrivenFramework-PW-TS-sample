import path from "path";
import {
    FileSystemWriter,
    ReporterRuntime,
} from "allure-js-commons/sdk/reporter";
import {
    ContentType,
    LabelName,
    Status
} from "allure-js-commons";

type Uuid = string;

export class AllureV3 {
    private readonly writer: FileSystemWriter;
    private runtime: ReporterRuntime;
    private currentTest?: Uuid;
    private stepStack: Uuid[] = [];
    private defaultSuite?: string;

    constructor(resultsDir = path.join(process.cwd(), "allure-results")) {
        this.writer = new FileSystemWriter({ resultsDir });
        this.runtime = new ReporterRuntime({ writer: this.writer });
    }

    setDefaultSuite(name: string) {
        this.defaultSuite = name;
    }

    startTest(testName: string, suite?: string) {
        const suiteName = suite ?? this.defaultSuite ?? "Default Suite";
        const fullName = `${suiteName}#${testName}`;

        // используем дефолтные значения для теста
        this.currentTest = this.runtime.startTest({
            name: testName,
            labels: [{ name: LabelName.SUITE, value: suiteName }],
        });

        // инициализируем fullName и соответствующий testCaseId, чтобы Allure различал разные сценарии
        this.runtime.updateTest(this.currentTest, (t) => {
            t.fullName = fullName;
            (t.labels ??= []).push({ name: LabelName.FEATURE, value: fullName });
        });
    }

    parameter(name: string | undefined, value: any) {
        if (!this.currentTest) return
        if (!name) return;
        this.runtime.updateTest(this.currentTest, (t) => {
            (t.parameters ??= []).push({ name: name, value: JSON.stringify(value) });
        });
    }

    async step<T>(title: string, body: () => Promise<T> | T): Promise<T> {
        if (!this.currentTest) throw new Error("Тесты не найдены");
        const parent = this.stepStack[this.stepStack.length - 1];
        const stepUuid = (this.runtime.startStep(this.currentTest, parent, { name: title }) as string);
        this.stepStack.push(stepUuid);
        try {
            const res = await body();
            this.runtime.updateStep(stepUuid, (s) => { s.status = Status.PASSED; });
            return res;
        } catch (e: any) {
            this.runtime.updateStep(stepUuid, (s) => {
                s.status = Status.FAILED;
                s.statusDetails = { message: e?.message ?? String(e) };
            });
            throw e;
        } finally {
            this.runtime.stopStep(stepUuid);
            this.stepStack.pop();
        }
    }

    async attachToTest(name: string, filePath: string, type: ContentType | string) {
        if (!this.currentTest) return;

        const ext = path.extname(filePath).slice(1) || "dat";
        // добавляем в сценарий (или текущий шаг)
        const parentStep = this.runtime.currentStep(this.currentTest) ?? undefined;

        this.runtime.writeAttachment(
            this.currentTest,
            parentStep,
            name,
            filePath,
            {
                contentType: typeof type === "string" ? type : type,
                fileExtension: ext,
            }
        );
    }

    passTest() {
        if (!this.currentTest) return;
        this.runtime.updateTest(this.currentTest, (t) => { t.status = Status.PASSED; });
        this.runtime.stopTest(this.currentTest);
        this.runtime.writeTest(this.currentTest);
        this.currentTest = undefined;
    }

    failTest(error: unknown) {
        if (!this.currentTest) return;
        const msg = (error as any)?.message ?? String(error);
        this.runtime.updateTest(this.currentTest, (t) => {
            t.status = Status.FAILED;
            t.statusDetails = { message: msg };
        });
        this.runtime.stopTest(this.currentTest);
        this.runtime.writeTest(this.currentTest);
        this.currentTest = undefined;
    }
}
