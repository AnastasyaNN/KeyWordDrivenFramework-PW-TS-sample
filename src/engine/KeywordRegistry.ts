import { NavigationKeywords } from '../keywords/NavigationKeywords';
import {PlaywrightController} from "./PlaywrightController";
import {AssertionKeywords} from "../keywords/AssertionKeywords";
import {DomElementsKeywords} from "../keywords/DomElementsKeywords";
import {DemoTodoAppKeywords} from "../keywords/DemoTodoAppKeywords";
import {DemoTodoAppAssertionKeywords} from "../keywords/DemoTodoAppAssertionKeywords";

export class KeywordRegistry {
    private navigation: NavigationKeywords;
    private assertion: AssertionKeywords;
    private domElements: DomElementsKeywords;
    private demoTodoApp: DemoTodoAppKeywords;
    private demoTodoAppAssertion: DemoTodoAppAssertionKeywords;

    constructor(playwrightController: PlaywrightController) {
        this.navigation = new NavigationKeywords(playwrightController);
        this.assertion = new AssertionKeywords(playwrightController);
        this.domElements = new DomElementsKeywords(playwrightController);
        this.demoTodoApp = new DemoTodoAppKeywords(playwrightController);
        this.demoTodoAppAssertion = new DemoTodoAppAssertionKeywords(playwrightController);
    }

    async executeKeyword(keyword: string, object?: string, value?: string): Promise<void> {
        // при большом количестве ключевых слов лучше реализовать как стратегию:
        // 1. Сделать KeywordFactory, задача которой по заданному keyword вернуть соответствующий класс ...Keywords
        // 2. Все ...Keywords классы должны наследовать от одного интерфейса с методом execute(object, value)
        // 3. Конкретный ...Keywords класс реализует метод execute
        // 4. KeywordRegistry становится KeywordExecutor, внутри executeKeyword создается ...Keywords при помощи KeywordFactory
        // и вызывается execute
        switch (keyword) {
            case 'открытьСтраницу':
                await this.navigation.navigateToUrl(value!);
                break;
            case 'вернуться':
                await this.navigation.goBack();
                break;
            case 'вперёд':
                await this.navigation.goForward();
                break;
            case 'обновитьСтраницу':
                await this.navigation.refreshPage();
                break;
            case 'проверитьЗаголовокСтраницы':
                await this.assertion.verifyPageTitle(value!);
                break;
            case 'кликНаСсылку':
                await this.domElements.clickElement(object!)
                break;
            case 'создатьЗадачу':
                await this.demoTodoApp.createNewTodo(value!)
                break;
            case 'проверитьЗадачуВСписке':
                await this.demoTodoAppAssertion.verifyTodoInTheList(value!)
                break;
            case 'проверитьЧтоВводПуст':
                await this.demoTodoAppAssertion.verifyToDoInputIsEmpty()
                break;
            case 'завершитьЗадачу':
                await this.demoTodoApp.completeToDo(value!)
                break;
            case 'проверитьЗавершениеЗадачи':
                await this.demoTodoAppAssertion.verifyToDoCompletion(value!)
                break;
            default:
                throw new Error(`Неизвестное слово: ${keyword}`);
        }
    }
}