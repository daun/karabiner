import fs from "node:fs";
import { config } from "./rules";
import { sortObjectKeys } from "./utils";

fs.writeFileSync(
  "build/karabiner.json",
  JSON.stringify(config, sortObjectKeys, 4),
);
