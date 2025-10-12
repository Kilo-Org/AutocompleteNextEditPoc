interface Person {}
interface Address {}

export function func1(person: Person): Address { return {} as Address; }




export function func2(people: Person[]): Address[] { return [] as Address[]; }




export function func3(person: Person): void {}




export function func4(): Person { return {} as Person; }




export function func5(people: Person[]): Address[] { return [] as Address[]; }




export function func6<T extends Person | Address>(value: T): T { return value; }




export function func7(value: Person | Address): Person | Address { return value; }




export function func8(person: Person, address: Address): void {}