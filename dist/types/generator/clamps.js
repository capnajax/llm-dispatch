#!/usr/bin/env -S tsx --enable-source-maps
/**
 * @module
 * Generator that converts a set of validators into asserts, typeclamps, and
 * tests. Assumes every exported validator has a type with the same name but
 * without the `validate` prefix, that is, a validateXYZ implies a type XYZ.
 *
 * We're using the following naming convention:
 *  - `XYZ` is the type
 *  - `validateXYZ(o:any, path?: string): string[]` is a validator function. It
 *      returns a list of error messages, which is empty if there are no errors.
 *      The `path` parameter is used to build meaningful error messages. If
 *      `path` is `undefined`, error messages will not be meaningful.
 *  - `testXYZ(o: any): boolean` (generated) simply returns `true` if `o` is a
 *      valid `XYZ`, `false` if not. Does not clamp.
 *  - `isXYZ(o: any): o is XYZ` (generated) returns `true` and clamps to `XYZ`
 *      if `o` is a valid `XYZ`, returns `false` if not.
 *  - `assertXYZ(o: any): asserts o is XYZ` (generated) returns nothing but
 *      clamps `o` to `XYZ` if `o` is a valid `XYZ` and throws an exception if
 *      it does not.
 *  - `normalizeXYZ(o: any, path?: string): Normalization<T>` (suggested form)
 *      normalizes an object of type `XYZ` to a specific form of that type. For
 *      example, if XYZ can be a string or a number, I can use this to normalize
 *      to a string. The returned object has a `valid:boolean` and either a
 *      `value: T` or `errors: string[]` depending on validity. It is
 *      recommended that `T` be a valid `XYZ` and all `XYZ` of values of the
 *      same meaning normalize to the exact same value of `T`
 *  - `convertXYZ(o: XYZ): T` (suggested form) is similar to `normalizeXYZ`
 *      except that it assumes the input object is valid and throws it isn't.
 */
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { Project } from 'ts-morph';
async function main() {
    const sourceDirArg = process.argv[2];
    const outDirArg = process.argv[3];
    if (!sourceDirArg || !outDirArg) {
        console.error('Usage: tsx --enable-source-maps clamps.ts ' +
            '[sourcedir] [outdir]');
        process.exitCode = 1;
        return;
    }
    const sourceDir = path.resolve(sourceDirArg);
    const outDir = path.resolve(outDirArg);
    if (sourceDir === outDir) {
        throw new Error('sourcedir and outdir must be different directories');
    }
    const project = new Project({
        skipAddingFilesFromTsConfig: true
    });
    project.addSourceFilesAtPaths(path.join(sourceDir, '**/*.ts'));
    let generatedCount = 0;
    for (const sourceFile of project.getSourceFiles()) {
        if (sourceFile.isDeclarationFile()) {
            continue;
        }
        const validators = findValidators(sourceFile);
        if (!validators.length) {
            continue;
        }
        await generateFile(sourceDir, outDir, sourceFile, validators);
        generatedCount++;
    }
    console.log(`Generated ${generatedCount} file` +
        `${generatedCount === 1 ? '' : 's'}.`);
}
function findTypeImport(sourceFile, outputPath, typeName) {
    const localType = sourceFile.getTypeAlias(typeName) ??
        sourceFile.getInterface(typeName) ??
        sourceFile.getClass(typeName) ??
        sourceFile.getEnum(typeName);
    if (localType) {
        if (!localType.isExported()) {
            throw new Error(`Type ${typeName} is declared in ` +
                `${sourceFile.getFilePath()} but is not exported`);
        }
        return {
            typeName,
            moduleSpecifier: makeImportPath(outputPath, sourceFile.getFilePath())
        };
    }
    for (const declaration of sourceFile.getImportDeclarations()) {
        for (const namedImport of declaration.getNamedImports()) {
            const localName = namedImport.getAliasNode()?.getText() ??
                namedImport.getName();
            if (localName !== typeName) {
                continue;
            }
            const importedName = namedImport.getName();
            const importedSource = declaration.getModuleSpecifierSourceFile();
            if (importedSource) {
                return {
                    typeName: importedName,
                    moduleSpecifier: makeImportPath(outputPath, importedSource.getFilePath())
                };
            }
            const moduleSpecifier = declaration.getModuleSpecifierValue();
            if (!moduleSpecifier.startsWith('.')) {
                return {
                    typeName: importedName,
                    moduleSpecifier
                };
            }
            throw new Error(`Could not resolve type ${typeName} imported ` +
                `from ${moduleSpecifier} in ` +
                sourceFile.getFilePath());
        }
    }
    throw new Error(`Could not find a declaration or import for type ` +
        `${typeName} in ${sourceFile.getFilePath()}`);
}
function findValidators(sourceFile) {
    const validators = [];
    for (const fn of sourceFile.getFunctions()) {
        const name = fn.getName();
        if (!name?.startsWith('validate')) {
            continue;
        }
        if (!fn.isExported()) {
            continue;
        }
        const typeName = name.substring('validate'.length);
        if (!typeName) {
            continue;
        }
        const params = fn.getParameters();
        if (params.length < 1) {
            continue;
        }
        const firstParam = params[0];
        if (firstParam.getName() !== 'o' ||
            firstParam.getTypeNode()?.getText() !== 'any') {
            continue;
        }
        const extraParamsAreOptional = params
            .slice(1)
            .every(param => param.isOptional() ||
            param.hasInitializer());
        if (!extraParamsAreOptional) {
            continue;
        }
        const param = params[0];
        if (param.getName() !== 'o') {
            continue;
        }
        const paramType = param.getTypeNode();
        if (!paramType ||
            paramType.getText() !== 'any') {
            continue;
        }
        const returnType = fn.getReturnTypeNode();
        if (!returnType ||
            returnType.getText() !== 'string[]') {
            continue;
        }
        validators.push({
            functionName: name,
            typeName
        });
    }
    return validators;
}
async function generateFile(sourceDir, outDir, sourceFile, validators) {
    const sourcePath = sourceFile.getFilePath();
    const relativePath = path.relative(sourceDir, sourcePath);
    const parsed = path.parse(relativePath);
    const outputPath = path.join(outDir, parsed.dir, `${parsed.name}-clamps.ts`);
    await fs.mkdir(path.dirname(outputPath), {
        recursive: true
    });
    const importPath = makeImportPath(outputPath, sourcePath);
    const decommaLastLine = () => {
        lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, '');
    };
    const lines = [];
    lines.push('// THIS FILE IS GENERATED. DO NOT EDIT.');
    lines.push('');
    lines.push('import {');
    for (const validator of validators) {
        lines.push(`  ${validator.functionName},`);
    }
    decommaLastLine();
    lines.push(`} from '${importPath}';`);
    lines.push('');
    lines.push('export {');
    for (const validator of validators) {
        lines.push(`  ${validator.functionName},`);
    }
    decommaLastLine();
    lines.push('};');
    lines.push('');
    const typeImports = validators.map(validator => findTypeImport(sourceFile, outputPath, validator.typeName));
    const importsByModule = new Map();
    for (const typeImport of typeImports) {
        let names = importsByModule.get(typeImport.moduleSpecifier);
        if (!names) {
            names = new Set();
            importsByModule.set(typeImport.moduleSpecifier, names);
        }
        names.add(typeImport.typeName);
    }
    for (const [moduleSpecifier, typeNames] of importsByModule) {
        lines.push('import type {');
        for (const typeName of typeNames) {
            lines.push(`  ${typeName},`);
        }
        decommaLastLine();
        lines.push(`} from '${moduleSpecifier}';`);
        lines.push('');
        lines.push('export type {');
        for (const typeName of typeNames) {
            lines.push(`  ${typeName},`);
        }
        decommaLastLine();
        lines.push('};');
    }
    lines.push('');
    for (const validator of validators) {
        generateValidatorFunctions(lines, validator);
    }
    await fs.writeFile(outputPath, lines.join('\n'), 'utf8');
    console.log(`${relativePath} -> ` +
        `${path.relative(outDir, outputPath)}`);
}
function generateValidatorFunctions(lines, validator) {
    const { functionName, typeName } = validator;
    lines.push(`export function is${typeName}(` +
        'o: any', `): o is ${typeName} {`, `  return ${functionName}(o).length === 0;`, '}', '');
    lines.push(`export function assert${typeName}(` +
        'o: any', `): asserts o is ${typeName} {`, `  const errors = ${functionName}(o);`, '', '  if (errors.length) {', "    throw new Error(errors.join('\\n'));", '  }', '}', '');
    lines.push(`export function test${typeName}(` +
        'o: any', '): boolean {', `  return ${functionName}(o).length === 0;`, '}', '');
}
function makeImportPath(outputPath, sourcePath) {
    let relative = path.relative(path.dirname(outputPath), sourcePath);
    relative = relative.replace(/\\/g, '/');
    relative = relative.replace(/\.(?:mts|cts|tsx|ts)$/, '.js');
    if (!relative.startsWith('.')) {
        relative = `./${relative}`;
    }
    return relative;
}
main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=clamps.js.map