export class ObjectRepository {
    private objects: Map<string, string> = new Map();

    constructor() {
        this.initializeDefaultObjects();
    }

    private initializeDefaultObjects() {
        this.addObject('getStartedLink', '.getStarted_Sjon');
        this.addObject('username_input', '#username');
        this.addObject('password_input', '#password');
        this.addObject('login_button', 'button[type="submit"]');
        this.addObject('welcome_message', '.welcome-text');
        this.addObject('error_message', '.error-message');
    }

    getLocator(elementName: string): string {
        const locator = this.objects.get(elementName);
        if (!locator) {
            throw new Error(`Неподдерживаемый элемент '${elementName}'`);
        }
        return locator;
    }

    addObject(name: string, locator: string): void {
        this.objects.set(name, locator);
    }
}