import {TestRunner} from './engine/TestRunner';
const args = require('minimist')(process.argv.slice(2));
const workerStr = args.worker as string | undefined; // например, "1/2"
let workerIndex = 0, workerCount = 1;
if (workerStr) {
    const [i, c] = workerStr.split("/").map(Number);
    workerIndex = i - 1; // уменьшаем индекс на 1 (если 1, то нам нужен 0 и т.д.)
    workerCount = c;
}

async function runAllTests() {
    const testRunner = new TestRunner();
    const testScenarios = [
        'example-test.csv',
        'demo-todo-app-test.csv'
    ];

    try {
        console.log('Инициализирую KDT Playwright Framework...');
        await testRunner.initialize();

        let totalPassed = 0;
        let totalFailed = 0;

        for (const testFile of testScenarios) {
            console.log(`\n Запускаю тесты из файла: ${testFile}`);
            console.log('─'.repeat(50));

            const results = await testRunner.runTests(testFile, workerIndex, workerCount);

            // Вывод результатов
            console.log(`Результаты:`)
            for (let result of results) {
                console.log(`Тест-кейс: ${result.testCase}`)
                console.log(`Результат: ${result.passed ? '✓ PASSED' : '✗ FAILED'}`);

                result.steps.forEach(step => {
                    const statusIcon = step.status === 'passed' ? '✓' : '✗';
                    console.log(`  ${statusIcon} Шаг ${step.step}: ${step.keyword}`);
                    if (step.status === 'failed') {
                        console.log(`    Ошибка: ${step.message}`);
                    }
                });

                if (result.passed) {
                    totalPassed++;
                } else {
                    totalFailed++;
                }
            }
        }

        console.log('\nСводка:');
        console.log('─'.repeat(50));
        console.log(`Всего тестов: ${totalFailed + totalPassed}`);
        console.log(`Passed: ${totalPassed}`);
        console.log(`Failed: ${totalFailed}`);
        console.log(`Success rate: ${((totalPassed / (totalFailed + totalPassed)) * 100).toFixed(1)}%`);

    } catch (error) {
        console.error('Выполнение тестов прекращено с ошибкой:', error);
    } finally {
        console.log('\nОстанавливаю...');
        await testRunner.shutdown();
    }
}

runAllTests().catch(console.error);
