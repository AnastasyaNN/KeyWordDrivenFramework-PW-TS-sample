import {PlaywrightController} from "../engine/PlaywrightController";
import {DemoTodoPage} from "../pages/DemoTodoPage";

export class DemoTodoAppKeywords {
    private demoToDoPage: DemoTodoPage;

    constructor(private playwright: PlaywrightController) {
        this.demoToDoPage = new DemoTodoPage(playwright.page)
    }

    async createNewTodo(todo: string) {
        await this.demoToDoPage.createNewTodo(todo)
    }

    async completeToDo(todo: string) {
        await this.demoToDoPage.completeToDo(todo)
    }
}