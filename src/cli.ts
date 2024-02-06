#!/usr/bin/env node

import { main } from "./command-selector";

const run = async () => {
  await main(process.argv.slice(2));
};

void run();
