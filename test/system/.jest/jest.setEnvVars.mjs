/**
 * Environment variables for the aws-gip-edit system tests
 */

const { REL_SRC_DIR = '../../src/' }  = process.env; // Relative path from the unit test directory to the source directory

const TEST_ENV_DEFS = {
	NODE_ENV:               'test-unit',
	NODE_LOG_LEVEL:         'off',
	LOG_LEVEL_PRINT_CONFIG: 'off',
	REL_SRC_DIR,
	GIP_MAX_PROGRAMS:       '20',
};

Object.assign( process.env, TEST_ENV_DEFS );
