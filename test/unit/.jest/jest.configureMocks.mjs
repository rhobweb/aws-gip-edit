/**
 * Configure the mocked modules for the aws-gip-edit unit tests
 */

// Jest really doesn't like TypeScript mocks, have to explicitly mock them
import {jest} from '@jest/globals'; // For isolateModulesAsync
const libDynamodb    = jest.requireActual( '../__mocks__/@aws-sdk/lib-dynamodb.cjs' );
const clientDynamodb = jest.requireActual( '../__mocks__/@aws-sdk/client-dynamodb.cjs' );
jest.mock( '@aws-sdk/lib-dynamodb', () => ({ __esModule: true, ...libDynamodb }) );
jest.mock( '@aws-sdk/client-dynamodb', () => ({ __esModule: true, ...clientDynamodb }) );
