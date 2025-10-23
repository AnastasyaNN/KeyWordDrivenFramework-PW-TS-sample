import {Locator, Page} from "@playwright/test";

export class DemoTodoPage {
    private readonly page: Page;
    private readonly newTodoInput: Locator;
    private readonly toDoItems: Locator;

    constructor(page: Page) {
        this.page = page;
        this.newTodoInput = this.page.locator('.new-todo')
        this.toDoItems = this.page.getByTestId('todo-item')
    }

    async createNewTodo(todo: string) {
        await this.newTodoInput.fill(todo);
        await this.newTodoInput.press('Enter');
    }

    async completeToDo(todo: string) {
        const todoCheckBox = this.getCompleteCheckBoxOfToDoItemWithText(todo)
        await todoCheckBox.check()
    }

    getToDoItemWithText(todo: string) {
        return this.toDoItems.filter({ hasText: todo }).first()
    }

    async getNewTodoInput() {
        return this.newTodoInput
    }

    getCompleteCheckBoxOfToDoItemWithText(todo: string) {
        const todoItem = this.getToDoItemWithText(todo)
        return todoItem.getByRole('checkbox')
    }
}