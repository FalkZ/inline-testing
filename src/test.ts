enum TestState {
  Ok = "ok",
  Fail = "fail",
}

interface TestMethods {
  ok: (...args: any[]) => void;
  fail: (...args: any[]) => void;
  equals<T>(actual: T, expected: T, ...args: any[]): void;
}

const createTestMethods = (
  testName: string,
  fn: (testMethods: TestMethods, ...args: any[]) => any,
  args: any[]
) =>
  new Promise((resolve) => {
    const methods: TestMethods = {
      ok: (...args) => resolve({ testName, testState: TestState.Ok, args }),
      fail: (...args) =>
        resolve({
          testName,
          testState: TestState.Fail,
          args: [...args, new Error(testName)],
        }),
      equals: (actual, expected, ...args) => {
        if (expected === actual) {
          methods.ok("is equal\n", ...args);
        } else {
          methods.fail("expected", expected, "but got", actual, "\n", ...args);
        }
      },
    };
    return fn(methods, ...args);
  }).catch((err) => ({ testName, testState: TestState.Fail, args: [err] }));

const logOk = (name: string, args: any[]) => {
  console.groupCollapsed(`%c ✔ ${name}`, "color: #0CA270");
  args.forEach((arg) => console.log(arg));
  console.groupEnd();
};

const logFail = (name: string, args: any[]) => {
  console.groupCollapsed(`%c ✖ ${name}`, "color: #FD0E35");
  console.error(...args);
  console.groupEnd();
};

const testProvider =
  (devModeFlag: boolean) =>
  async (
    test: () => Promise<{ [key: string]: (testMethods: TestMethods) => any }>,
    ...args
  ) => {
    if (devModeFlag) {
      let mod = await test().catch((e) => {
        console.error("could not get test module:", e);
        return {};
      });

      let tests = Object.entries(mod)
        // .filter(([key]) => key !== "test")
        .map(([key, fn]) => createTestMethods(key, fn, args));

      Promise.all(tests).then((tests) => {
        let fails = tests.reduce(
          (acc: number, { testState }) =>
            testState === TestState.Fail ? acc + 1 : acc,
          0
        );
        const message = fails
          ? `${fails} of ${tests.length} tests failed`
          : `${tests.length} tests succeeded`;

        let baseStyles = [
          "color: #fff",
          "background-color: " + (fails ? "#FD0E35" : "#0CA270"),
          "padding: 0 4px",
          "border-radius: 2px",
        ].join(";");

        console.groupCollapsed(`%c${test.toString()} ${message}`, baseStyles);
        tests.forEach(({ testName, testState, args }) =>
          testState === TestState.Fail
            ? logFail(testName, args)
            : logOk(testName, args)
        );
        console.groupEnd();
      });
    }
  };

export default testProvider;
