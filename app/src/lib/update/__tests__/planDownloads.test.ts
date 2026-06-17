import { describe, it, expect } from "vitest";
import { planDownloads } from "../UpdateService";
import type { BaseManifest } from "../manifest";

const manifest: BaseManifest = {
  data_version: "2026.07.01-r2",
  files: [
    { name: "materiais.json", sha256: "aaa", bytes: 10 },
    { name: "catalog.json", sha256: "bbb", bytes: 20 },
    { name: "structures/S1.json", sha256: "ccc", bytes: 30, asset: "structures__S1.json" },
    { name: "structures/S2.json", sha256: "ddd", bytes: 40, asset: "structures__S2.json" },
  ],
};

describe("planDownloads", () => {
  it("baixa só os arquivos cujo sha256 difere do local", () => {
    const local = {
      "materiais.json": "aaa", // igual → não baixa
      "catalog.json": "old", // mudou → baixa
      "structures/S1.json": "ccc", // igual → não baixa
      "structures/S2.json": "old", // mudou → baixa
    };
    const plan = planDownloads(manifest, local);
    expect(plan.map((f) => f.name)).toEqual(["catalog.json", "structures/S2.json"]);
  });

  it("baixa arquivos ausentes localmente (cliente sem aquele arquivo)", () => {
    const local = { "materiais.json": "aaa" };
    const plan = planDownloads(manifest, local);
    expect(plan.map((f) => f.name)).toEqual([
      "catalog.json",
      "structures/S1.json",
      "structures/S2.json",
    ]);
  });

  it("nada a baixar quando tudo bate", () => {
    const local = {
      "materiais.json": "aaa",
      "catalog.json": "bbb",
      "structures/S1.json": "ccc",
      "structures/S2.json": "ddd",
    };
    expect(planDownloads(manifest, local)).toHaveLength(0);
  });
});
