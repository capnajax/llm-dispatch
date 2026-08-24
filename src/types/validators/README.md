# Runtime validators and generated clamps

The files in this directory define handwritten runtime validators for
TypeScript types. Those validators are also the source from which the project
generates type guards, assertions, and boolean tests.

The central relationship is:

```text
exported type XYZ
       +
validateXYZ(o, path?)
       |
       v
clamp generator
       |
       +-- isXYZ(o): o is XYZ
       +-- assertXYZ(o): asserts o is XYZ
       `-- testXYZ(o): boolean
```

This provides runtime checks for structural and semantic constraints that a
TypeScript declaration alone cannot enforce, such as value ranges, formats,
and relationships between members.

## Validator contract

A validator intended for clamp generation has this interface:

```ts
export function validateXYZ(o: any, path?: string): string[]
```

Its behavior is:

- Return `[]` when `o` is a valid `XYZ`.
- Return one or more strings when `o` is invalid.
- Use `path` as the name of the subject in diagnostic messages.
- Use the sentinel `E` (`"error"`) when a useful path was not supplied.
- Do not transform or clamp `o`; validation only reports validity.

The optional path supports two modes. A truthy path requests detailed,
path-qualified diagnostics and causes the shared test runner to collect all
available errors. With no truthy path, only validity matters, so validators may
return generic errors and stop after the first failure.

Callers that display errors should therefore provide a meaningful root path:

```ts
const errors = validateXYZ(value, '[configuration]');
```

Generated functions call validators without a path because they primarily
need the valid/invalid result.

## Generated API

The clamp generator is `src/types/generator/clamps.ts`. For every validator it
discovers, it generates three companions:

| Function | Result |
| --- | --- |
| `isXYZ(o)` | Returns a boolean and narrows `o` to `XYZ` in the true branch. |
| `assertXYZ(o)` | Narrows `o` to `XYZ`, or throws errors joined by newlines. |
| `testXYZ(o)` | Returns a boolean without narrowing. |

The generated module also re-exports the validator and its corresponding type.
Generated files are written under `src/types/generated` and must not be edited
by hand. The generator's source argument may be either one TypeScript file or a
directory; directory input is scanned recursively.

Discovery is deliberately syntactic. A function qualifies only when:

- its name starts with `validate` and has a non-empty suffix;
- it is exported;
- its first parameter is named `o` and explicitly typed `any`;
- any additional parameters are optional or have default values; and
- its return type is explicitly written as `string[]`; and
- its matching local type, when locally declared, is exported.

For `validateXYZ`, the generator looks for an exported local type named `XYZ`
or a named import of that type. An exported validator for a non-exported local
type remains available to application code but does not produce clamps. A
validator with a different parameter or return annotation likewise does not
produce clamps.

Run the project generator after adding or changing the exported validator set:

```sh
npm run generate
```

## Composing validators

Most composite validators use the helpers in `../types-tools.ts`:

```ts
export function validateWidget(o: any, path?: string): string[] {
  const result: string[] = [];

  doTests([result, o, path], itemsFromTuples(
    [true, 'object', '%s must be an object'],
    [true, 'string', '%s must be a string', 'name'],
    [false, 'string', '%s must be a string or undefined', 'label'],
    tv(result, validateSettings, path, 'settings'),
    tva(result, validateEntry, path, 'entries')
  ));

  return result;
}
```

The root object test normally comes first. That gives predicate mode a safe,
inexpensive failure before any nested member validators run.

### `itemsFromTuples`

`itemsFromTuples` converts compact declarations into the `TestItem` objects
consumed by `doTests`. A tuple has the form:

```text
[required, test, failureMessage, member?]
```

- `required` determines whether an `undefined` member is an error. If it is
  `false`, an absent member is skipped. A present but invalid value still
  fails.
- `test` may be a JavaScript `typeof` name, a boolean, or a test function.
- `failureMessage` contains `%s`, which is replaced with the subject path.
- `member` selects a property from the object. Without it, the test applies to
  the object itself.

The `"object"` test accepts non-null objects. `NULLABLE_OBJECT` is available
when JavaScript's broader `typeof value === "object"` behavior is wanted.

Functions returned by `tv` and `tva` can be passed directly to
`itemsFromTuples`; those functions append their own nested validation errors.

### `doTests`

`doTests` receives `[result, o, path]` plus one or more tests. It:

1. Selects either `o` or the requested member.
2. Skips an absent optional member.
3. Runs the declared primitive test or test function.
4. Formats and appends a failure message when needed.
5. Continues through all tests in diagnostic mode, or stops after a failure in
   predicate mode.

Tests run in declaration order. This makes the ordering part of the validator's
control flow when no path is supplied.

### `tv`

`tv` adapts another validator into a `TestFunc`. It can validate the current
subject or one of its members, passes the appropriate child path to the nested
validator, and appends the nested errors to the shared result.

Common forms are:

```ts
tv(result, validateChild, path)                  // current subject
tv(result, validateChild, path, 'child')         // required member
tv(result, validateChild, path, 'child', false)  // optional member
```

Optional means that `undefined` is accepted by omission. `null` is a supplied
value and is not treated as omitted.

### `tva`

`tva` is the array form of `tv`. It requires the selected value to be an array
and applies the supplied validator to every item. Diagnostic item paths append
the array index:

```text
[configuration].entries[0]
[configuration].entries[1]
```

It has the same required and optional member forms as `tv`:

```ts
tva(result, validateEntry, path, 'entries')
tva(result, validateEntry, path, 'entries', false)
```

### Leaf validators

Tests that cannot be represented by a primitive tuple are ordinary validators.
They should follow the same result and path rules:

```ts
function validatePositiveNumber(o: any, path?: string): string[] {
  if (typeof o !== 'number' || o <= 0) {
    return [path ? `${path} must be a positive number` : E];
  }
  return [];
}
```

A leaf validator may remain private when no generated guard, assertion, or
test is wanted for its value type.

### Logging

The validators in this directory conventionally log their input at `silly`
level and call `logResult` before returning. `logResult` logs each failure at
`debug`, or `[no errors]` at `silly`.

Logging is conventional rather than part of the interface recognized by the
generator.

## How the current modules use the pattern

`connectivity.ts` defines reusable validators for complete and partial runtime
types. Composite validators reuse smaller validators through `tv` and `tva`,
while private leaf validators enforce value-level constraints.

`raw-config.ts` applies the same machinery to the looser shape accepted from
configuration files. It reuses partial connectivity validators because a raw
host or defaults record may provide only part of a value that will later become
complete. Its exported `validateConfigAsLoaded` follows the generator contract
and therefore produces the corresponding generated clamps.

The normalization functions colocated in `raw-config.ts` are downstream
consumers of validation. They use the separate `Normalized<T>` result type to
return either a normalized value or validation errors. Normalization is useful
for turning a validated input representation into its effective runtime form,
but it is not required by the validator interface or clamp generator.

## Adding another validator family

Use this checklist when applying the pattern to another set of types:

1. Define and export the runtime type `XYZ`.
2. Export `validateXYZ(o: any, path?: string): string[]` from a validator
   source file.
3. Start composite validators with an empty shared result and, normally, a
   root shape test.
4. Use tuples for primitive member checks, `tv` for nested values, and `tva`
   for arrays of nested values.
5. Mark a member optional only when an omitted `undefined` value is valid.
6. Make custom leaf validators return path-qualified errors or `E` according
   to the shared contract.
7. Keep helper validators private unless their types should receive their own
   generated API.
8. Run `npm run generate` and inspect the resulting clamp module.
9. Test valid and invalid inputs both with and without a diagnostic path, then
   exercise the generated `is`, `assert`, and `test` functions.
