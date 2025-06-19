//import { join } from 'path';

import yaml from 'js-yaml';
import fs from 'fs';

const lambdaExecutionRolePolicy = yaml.load(
  fs.readFileSync('./serverless/policies/default/lambda-execution-role-policy.yml', 'utf8')
);

const stackPolicy = yaml.load(
  fs.readFileSync('./serverless/policies/default/stack-policy.yml', 'utf8')
);

const resourceDynamodbTables = yaml.load(
  fs.readFileSync('./serverless/resources/dynamodb-tables.yml', 'utf8')
);
const resourceApiGateway = yaml.load(
  fs.readFileSync('./serverless/resources/api-gateway.yml', 'utf8')
);
const resourceS3Dist = yaml.load(
  fs.readFileSync('./serverless/resources/s3-dist.yml', 'utf8')
);

const basePath    = 'gip_edit';
const apiBasePath = process.env.IS_OFFLINE === 'true' ? basePath : '';
const distDirPath = 'dist/';
const apiDistDir  = process.env.IS_OFFLINE === 'true' ? distDirPath : '';

const stageToDefaultCustomDomainMap = {
  lcl: 'localhost',
  dev: 'dev.rhobweb.com',
  test: 'test.rhobweb.com',
  prod: 'rhobweb.com',
};

const region = process.env.AWS_REGION ?? 'eu-west-1';
const stage  = process.env.STAGE      ?? 'dev';

const stageToAuthUriMap = {
  lcl:  'localhost:3013/sso',
  dev:  'dev.rhobweb.com/sso',
  test: 'test.rhobweb.com/sso',
  prod: 'rhobweb.com/sso',
};

export default {
  service: 'gip-edit-react',
  frameworkVersion: '4',
  useDotenv: true,
  disabledDeprecations: [
    'CLI_OPTIONS_SCHEMA', // some Serverless plugins haven't been updated yet and generate warnings
  ],
  plugins: [
    'serverless-webpack',
    'serverless-plugin-scripts',
    'serverless-offline',
    'serverless-s3-deploy',
    'serverless-domain-manager',
  ],
  build: {
    esbuild: false,
  },
  provider: {
    name: 'aws',
    runtime: 'nodejs22.x',
    region,
    stage,
    memorySize: 512,
    timeout: 6,
    logRetentionInDays: 7,
    apiGateway: {
      shouldStartNameWithService: true, // for upcoming Serverless v3
    },
    iam: {
      role: {
        statements: [...lambdaExecutionRolePolicy],
      },
    },
    stackPolicy: [ ...stackPolicy ],
    environment: {
      SERVERLESS_PROJECT:       'gip-edit-react',
      SERVERLESS_REGION:        region,
      SERVERLESS_STAGE:         stage,
      NODE_LOG_LEVEL:           process.env.NODE_LOG_LEVEL || 'info',
      APP_DIST_URL:             process.env.APP_DIST_URL   || 'default',
      APP_PUBLIC_URL:           process.env.APP_PUBLIC_URL || 'default',
      APIGATEWAY_URL:           `https://${region}.execute-api.amazonaws.com/${stage}`,
      IS_LOCAL:                 process.env.IS_LOCAL || 'false',
      LOCAL_DYNAMO_DB_ENDPOINT: process.env.LOCAL_DYNAMO_DB_ENDPOINT || 'http://localhost:8000',
      GIP_MAX_PROGRAMS:         process.env.GIP_MAX_PROGRAMS || '50',
      AUTH_URI:                 process.env.AUTH_URI || 'http://localhost:3013/sso',
    },
  },
  custom: {
    serviceName: 'gip-edit-react',
    stage,
    apiGatewayRestApiName: `${stage}-gip-edit-react`,
    baseDomain: 'rhobweb.com',
    isOffline:  process.env.IS_OFFLINE === 'true' ? 'true' : 'false',
    isLocal:    process.env.IS_OFFLINE === 'true' ? 'true' : '',
    localDynamodbEndpoint: 'http://localhost:8000',
    maxPrograms: '50',
    NODE_LOG_LEVEL: process.env.NODE_LOG_LEVEL || 'info',
    defaultCustomDomain: stage === 'prod' ? 'rhobweb.com' : `dev.rhobweb.com`,
    customDomain: {
      domainName: process.env.customDomainName || 'dev.rhobweb.com',
      certificateName: process.env.customDomainCertificateName || '*.rhobweb.com',
      basePath,
      stage,
      enabled: true,
    },
    authURI: stageToAuthUriMap[ stage ],
    distBucketUrl: {
      'us-east-1': `https://s3.amazonaws.com/${process.env.DistBucket}`,
      default: `https://s3-${process.env.AWS_REGION}.amazonaws.com/${process.env.DistBucket}`,
    },
    dynamoTableNamePrefix: `${stage}_gip-edit-react_`,
    dynamoTableNameProgram: `${stage}_gip-edit-react-Program`,
    dynamoTableNameProgramHistory: `${stage}_gip-edit-react-ProgramHistory`,
    scripts: {
      hooks: {
        'package:initialize': 'npm run build:browser',
        'deploy:finalize': `npx sls s3deploy --stage ${stage}`,
      },
    },
    webpack: {
      webpackConfig: 'webpack.server.config.js',
    },
    assets: {
      auto: false,
      targets: [
        {
          bucket: process.env.DistBucket,
          acl: 'public-read',
          files: [
            {
              source: 'dist/',
              headers: {
                CacheControl: 'max-age=31104000', // 1 year
              },
              globs: ['**/*'],
            },
          ],
        },
      ],
    },
    'serverless-offline': {
      useChildProcesses: true,
      noPrependStageInUrl: true,
      host: '0.0.0.0',
      httpPort: 13003,
      lambdaPort: 13002,
    },
  },
  functions: {
    programs: {
      handler: `${apiDistDir}src/api/programs.handler`,
      events: [
        {
          http: {
            path: `${apiBasePath}/api/programs`,
            method: 'any',
            cors: true,
            integration: 'aws_proxy',
          },
        },
      ],
    },
    serve: {
      handler: 'main.serve',
      events: [
        {
          http: {
            path: `${apiBasePath}/`,
            method: 'any',
            cors: true,
            integration: 'aws_proxy',
          },
        },
        {
          http: {
            path: '/favicon.ico',
            method: 'get',
            cors: false,
          },
        },
      ],
    },
  },
  resources: [
    resourceDynamodbTables,
    resourceApiGateway,
    resourceS3Dist,
  ]
};
