import {defineConfig} from "@playwright/test";
import base from "../../tests/local-users/playwright.config";
export default defineConfig({...base,testDir:".",testMatch:"tapper-capture.spec.ts"});
