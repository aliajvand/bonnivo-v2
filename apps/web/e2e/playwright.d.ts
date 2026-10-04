declare module "@playwright/test" {
  export interface Page {
    goto(url: string, options?: any): Promise<any>;
    toHaveTitle(title: string | RegExp): Promise<void>;
    locator(selector: string): Locator;
    content(): Promise<string>;
    waitForTimeout(timeout: number): Promise<void>;
  }

  export interface Locator {
    first(): Locator;
    nth(index: number): Locator;
    count(): Promise<number>;
    isVisible(): Promise<boolean>;
    click(): Promise<void>;
    fill(value: string): Promise<void>;
  }

  export interface TestContext {
    page: Page;
  }

  export type TestFunction = (args: TestContext) => Promise<void> | void;

  export interface TestSuite {
    (name: string, fn: TestFunction): void;
    describe(name: string, fn: () => void): void;
  }

  export const test: TestSuite;
  export const expect: any;
  export function defineConfig(config: any): any;
  export const devices: Record<string, any>;
}
