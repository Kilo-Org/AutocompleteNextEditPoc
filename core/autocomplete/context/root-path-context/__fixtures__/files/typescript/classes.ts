// TypeScript class declaration fixtures for RootPathContextService tests
interface Person {}
interface Address {}
class BaseClass<T = unknown> {}
interface FirstInterface<T = unknown> {}
interface SecondInterface<T = unknown> {}
interface Gathering<T = unknown> {}

// line 2: class_declaration with base class
class GroupBase extends BaseClass<Person> {}

// spacer line 4

// line 5: class_declaration with interface
class GroupInterface implements FirstInterface<Address> {}

// spacer line 7

// line 8: class_declaration with base class and multiple interfaces
class GroupBaseMultiple extends BaseClass implements FirstInterface, SecondInterface {}

// spacer line 11

// line 12: class_declaration with base class and multiple interfaces (duplicate to mirror tests)
class GroupBaseMultipleDup extends BaseClass implements FirstInterface, SecondInterface {}

// spacer line 15

// line 16: class_declaration with generic base class and generic interface
class GroupGeneric extends BaseClass<Person> implements FirstInterface<Address> {}