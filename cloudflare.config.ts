import { defineConfig } from "cf/config";

export default defineConfig({
  accountId: "f001d6d293f329a87db71b4b9e05c3f0",
  worker: {
    name: "chazfab-web",
    compatibilityDate: "2026-11-18",
    workersDev: true,
    assets: {
      htmlHandling: "auto-trailing-slash",
      notFoundHandling: "none",
    },
    domains: ["chazfab.com", "www.chazfab.com"],
    observability: {
      enabled: true,
      logs: {
        enabled: true,
      },
      traces: {
        enabled: true,
      },
    },
  },
});
