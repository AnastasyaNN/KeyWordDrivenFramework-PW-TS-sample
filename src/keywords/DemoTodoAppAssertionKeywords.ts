import {PlaywrightController} from "../engine/PlaywrightController";
import {expect} from "@playwright/test";
import {DemoTodoPage} from "../pages/DemoTodoPage";

export class DemoTodoAppAssertionKeywords {
    private demoToDoPage: DemoTodoPage;

    constructor(private playwright: PlaywrightController) {
        this.demoToDoPage = new DemoTodoPage(playwright.page)
    }

    async verifyTodoInTheList(todo: string) {
        await expect(this.demoToDoPage.getToDoItemWithText(todo)).toBeVisible();
    }

    async verifyToDoInputIsEmpty() {
        await expect(await this.demoToDoPage.getNewTodoInput()).toBeEmpty();
    }

    async verifyToDoCompletion(todo: string) {
        await expect(this.demoToDoPage.getCompleteCheckBoxOfToDoItemWithText(todo)).toBeChecked()
    }
}