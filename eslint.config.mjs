import eslint      from '@eslint/js';
import jest        from 'eslint-plugin-jest';
import stylisticJs from '@stylistic/eslint-plugin';
import tsPlugin    from '@typescript-eslint/eslint-plugin';
import tsParser    from '@typescript-eslint/parser';
import tseslint    from 'typescript-eslint';

import { defineConfig, globalIgnores } from "eslint/config";
const ignores = defineConfig( [
	globalIgnores( [
		'.webpack/',
		'__mocks__/',
		'**/jest.config.mjs',
		'**/jest.common.config.mjs',
		'**/jest.setEnvVars.mjs',
		'**/eslint.config.mjs',
		'**/dist/',
		'**/output/',
		'**/test-out/',
		'**/node_modules/',
		'**/z-*.ts',
		'**/z-*.tsx',
		'**/*.js',
		'**/*.cjs',
		'**/*.mjs',
	] )
]);

const files = defineConfig( [
	{
		files: [
			[ 'src/**', '**/.ts' ],
			[ 'src/**', '**/.tsx' ],
			[ 'test/**', '**/.ts' ],
			[ 'test/**', '**/.tsx' ],
		],
	}
] );

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.recommended,
	tseslint.configs.recommendedTypeChecked,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	jest.configs['flat/recommended'],
	...ignores,
	...files,
	{
		plugins: {
			'@stylistic/js': stylisticJs,
			'@typescript-eslint': tsPlugin,
		},
		languageOptions: {
			parser: tsParser,
			ecmaVersion: 2022,
			sourceType: 'module',
			parserOptions: {
				project: './tsconfig-test.json', // Run eslint on both test and source code
				//projectService:  true,
				tsconfigRootDir: import.meta.dirname,
			},
			globals: {
				node: true,
				es2021: true,
				process: true,
				console: true,
				__dirname: true,
				queueMicrotask: true,
			},
		},
		rules: {
			//...jest.configs['flat/recommended'].rules,
			'@stylistic/js/semi': 'error',
			'@stylistic/js/indent': ['error', 'tab'],
			'@stylistic/js/no-trailing-spaces': 'error',
			'@stylistic/js/no-mixed-spaces-and-tabs': 'error',
			'complexity': ['error', {'max': 10, 'variant': 'classic'}],
			'@typescript-eslint/await-thenable': 'error',
			'@typescript-eslint/no-unused-vars': 'error',
			'@typescript-eslint/explicit-function-return-type': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-inferrable-types': 'warn',
		},
		//files: [
		//	[ 'src/**', '**/.ts' ],
		//	[ 'src/**', '**/.tsx' ],
		//	[ 'test/**', '**/.ts' ],
		//	[ 'test/**', '**/.tsx' ],
		//],
		//ignores: [
		//	'**/eslint.config.mjs',
		//	'**/\.webpack/',
		//	'**/dist/**',
		//	'**/node_modules/**'
		//	//'**/jest.config.ts',
		//	//'**/jest.setEnvVars.ts'
		//], // Does not match directories, only files, see https://eslint.org/docs/latest/use/configure/ignore
	}
);
