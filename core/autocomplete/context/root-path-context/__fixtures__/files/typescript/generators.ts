// TypeScript generator fixtures for RootPathContextService tests
interface Person {}
interface Address {}

// line 3: function_declaration with a param and a return type
export function getAddressGen(person: Person): Address {
  return {} as Address;
}


// spacer lines 4-6



// line 7: function_declaration with array param
export function getGroupAddressGen(people: Person[]): Address[] {
  return [] as Address[];
}


// spacer lines 8-10



// line 11: function_declaration without return type
export function logPersonGen(person: Person): void {
  void person;
}


// spacer lines 12-14



// line 15: function_declaration without params
export function getHardcodedAddressGen(): Address {
  return {} as Address;
}


// spacer lines 16-18



// line 19: function_declaration with array params and array return type
export function getPeopleAddressesGen(people: Person[]): Address[] {
  return [] as Address[];
}


// spacer lines 20-22



// line 23: function_declaration with generic params and generic return type
export function withGenericsGen<T extends Person | Address>(value: T): T {
  return value;
}


// spacer lines 24-26



// line 27: function_declaration with union type params and union return type
export function unionValueGen(value: Person | Address): Person | Address {
  return value;
}


// spacer lines 28-30



// line 31: function_declaration with two arguments
export function logBothGen(person: Person, address: Address): void {
  void person;
  void address;
}