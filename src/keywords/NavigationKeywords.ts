import {PlaywrightController} from "../engine/PlaywrightController";

export class NavigationKeywords {
    constructor(private playwrightController: PlaywrightController) {}

    async navigateToUrl(url: string) {
        await this.playwrightController.page.goto(url);
    }

    async goBack() {
        await this.playwrightController.page.goBack();
    }

    async goForward() {
        await this.playwrightController.page.goForward();
    }

    async refreshPage() {
        await this.playwrightController.page.reload();
    }
}