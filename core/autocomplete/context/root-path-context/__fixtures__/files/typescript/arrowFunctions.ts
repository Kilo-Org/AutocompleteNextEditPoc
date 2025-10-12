// TypeScript arrow function fixtures for RootPathContextService tests
interface Person {}
interface Address {}

// line 3: arrow_function with a param and a return type
export const getAddress = (person: Person): Address => {
  return {} as Address;
};


// spacer lines 4-6



// line 7: arrow_function without return type
export const logPerson = (person: Person): void => {
  void person;
};


// spacer lines 8-10



// line 11: arrow_function without params
export const getHardcodedAddress = (): Address => {
  return {} as Address;
};


// spacer lines 12-14



// line 15: arrow_function with array params and array return type
export const getPeopleAddresses = (people: Person[]): Address[] => {
  return [] as Address[];
};


// spacer lines 16-18



// line 19: arrow_function with generic params and generic return type
export const withGenerics = <T extends Person | Address>(value: T): T => {
  return value;
};


// spacer lines 20-22



// line 23: arrow_function with union type params and union return type
export const unionValue = (value: Person | Address): Person | Address => {
  return value;
};


// spacer lines 24-26



// line 27: arrow_function with two arguments
export const logBoth = (person: Person, address: Address): void => {
  void person;
  void address;
};