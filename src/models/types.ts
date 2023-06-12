export type JSONValue = string | number | boolean | JSONObject | JSONArray | null;

export type JSONObject = {
  readonly [x in string]: JSONValue;
};

type JSONArray = readonly JSONValue[];

export type StrictRequired<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};
