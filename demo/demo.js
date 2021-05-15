import createTest from "../src/test";

// provide dev flag so that tests only get executed in dev mode
const test = createTest(import.meta.env.DEV);

const result = 2 + 2;
/* 
test import
file is only imported and executed when in dev mode
arguments can be passed in to the like result
*/
test(() => import("./test/demoTests.js"), result, "second argument");
test(() => import("./test/demoAllOk.js"), result);
