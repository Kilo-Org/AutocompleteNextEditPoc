// TypeScript class method fixtures for RootPathContextService tests
interface Person {}
interface Address {}

class Example {
  // line 4: method_declaration with a param and a return type
  methodWithReturn(person: Person): Address {
    void person;
    return {} as Address;
  }

  // spacer line 8

  // line 9: method_declaration without arguments
  methodNoArgs(): Address {
    return {} as Address;
  }

  // spacer line 13

  // line 14: method_declaration without return type
  methodNoReturn(person: Person): void {
    void person;
  }

  // spacer line 18

  // line 19: method_declaration with array type arguments
  methodArrayArgs(people: Person[]): void {
    void people;
  }

  // spacer line 23

  // line 24: method_declaration with array type arguments and array type return
  methodArrayArgsAndReturn(people: Person[]): Address[] {
    void people;
    return [] as Address[];
  }

  // spacer line 29

  // line 30: method_declaration with with generic params and generic return type
  methodGeneric<T extends Person | Address>(value: T): T {
    return value;
  }

  // spacer line 35

  // line 36: method_declaration with union type params and union return type
  methodUnion(value: Person | Address): Person | Address {
    return value;
  }

  // spacer line 40

  // line 41: method_declaration with two arguments
  methodTwoArgs(person: Person, address: Address): void {
    void person;
    void address;
  }
}
