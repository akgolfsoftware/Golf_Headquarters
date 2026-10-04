import type { Reporter, TestCase, TestResult } from "@playwright/test/reporter";

/** A credential-gated test must actually run in this dedicated local suite. */
export default class NoSkips implements Reporter {
  private skipped = 0;
  onTestEnd(_test: TestCase, result: TestResult) {
    if (result.status === "skipped") this.skipped++;
  }
  async onEnd() {
    if (this.skipped) {
      console.error(`${this.skipped} local tests were skipped; this is a failed verification.`);
      return { status: "failed" as const };
    }
  }
}
