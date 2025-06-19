/**
 * Environment variables for the aws-gip-edit unit tests
 */

const { REL_SRC_DIR = '../../src/' }  = process.env; // Relative path from the unit test directory to the source directory

const TEST_ENV_DEFS = {
	NODE_ENV:               'test-unit',
	NODE_LOG_LEVEL:         'off',
	LOG_LEVEL_PRINT_CONFIG: 'off',
	REL_SRC_DIR,
	STAGE:                  'dev',
	SERVICE_NAME:           'test-aws-gip-edit',
	GIP_MAX_PROGRAMS:       '10',
};

Object.assign( process.env, TEST_ENV_DEFS );
