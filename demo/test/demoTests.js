export const asyncTest = ({ ok, fail }, result, secondArgument) => {
  setTimeout(
    () =>
      result === 4
        ? ok("result is as expected", secondArgument)
        : fail("result is unexpected:", result, secondArgument),
    2000
  );
};

export const equals = ({ equals }, result) => {
  equals(result, 4, "another argument");
};

export const equalsFail = ({ equals }, result) => {
  equals(result, 5);
};

export const throwInTest = () => {
  throw new Error("ErrorName");
};
