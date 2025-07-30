# aws-gip-edit

## Overview

BBC Sounds program list editor in React.js and AWS Lambda.
<br>This application allows a user to create a list of programs from the BBC Sounds program listings.
<br>This application provides a web page that allows a program to be dragged and dropped from the BBC Sounds program listing.
<br>The selected programs can then be stored in DynamoDB and the list retrieved using the API.
<br>These programs can then be downloaded using get_iplayer.
<br>Two DynamoDB tables are used:

  * programs : the list of programs that are to be or have been downloaded;
  * program history : a record of the program download attempts, successful and otherwise.

## Usage

### Program Selector

The program selector web page shall be available at:
  * https://{STAGE}.{GIP_DOMAIN}/gip_edit

where:
  * STAGE: is the staged environment, e.g., 'dev';
  * GIP_DOMAIN: is the domain to which it was deployed, e.g., 'domain.com';

### API

The API shall be available at (see Program Selector):

   * https://{STAGE}.{GIP_DOMAIN}/gip_edit/api/programs

#### Program Item

A program object contains the following properties:

| Property | Description |
|----------|-------------|
| pid | The PID that identifies the program, e.g., 'm002gbz4'. |
| title | A string without whitespace or special characters that describes the program, e.g., 'ClueS82E02'. |
| synopsis | A string that provides additional information about the program. |
| image_uri | The URI of the program image from the BBC Sounds website. |
| status | One of 'Pending','Success','Already','Error'. |
|| * 'Pending' - the program is to be downloaded; |
|| * 'Success' - the program has been successfully downloaded; |
|| * 'Already' - the program has been previously downloaded by get_iplayer; |
|| * 'Error'   - the program download attempt failed. |
| genre | One of 'Comedy' or 'Books&Spoken'. |
| day_of_week | Optional three character capitalised day of week to indicate the day that the program is available, e.g., 'Mon'. |
|| A program shall only be returned if the `day_of_week` is one of the previous two days. (Unless `current` is specified, see `GET`) |
| quality | One of 'Normal','High'. The required download quality. |
| modify_time | Date/time string of when the database object was last updated. |

#### GET

| Param | Description |
|-------|-------------|
| - | If no parameters are specified, returns the list of pending programs based on the current day. |
| all | Return all programs regardless of status or `day_of_week`. |
| current | Include any pending programs that have `day_of_week` set to the current day. |
| downloaded | Include programs that have already been downloaded. |

#### POST

Specify an array of `Program Item`s to replace the current list.

#### PATCH

Update the status of the program items and also update the program history table.
<br>Accepts an array of program items, but only the following properties are used:

| Property | Description |
|----------|-------------|
| pid      | Identifies the program. |
| status   | The program status, see `Program Item`. |

## Deployment

Update launch.json to set GIP_DOMAIN is be the deployment domain, e.g., 'domain.com'.
<br>Then run the `Deploy` debug target from VS Code.

## History

Copied from the following project:
  https://github.com/arabold/serverless-react-boilerplate


### Folder Structure

```
aws-gip-edit/
│
├── public/ - Public assets which will retain their original file names and folder structure
│   ├── favicon.ico - Favicon
│   └── manifest.json - Web page manifest
│   └── program_image_placeholder.png - Image to display when no program is selected.
│
├── src/
│   ├── browser/
│   │   └── ... - Client-side code running in the browser as well as during server-side rendering
│   ├── components/
│   │   └── ... - React components
│   ├── server/
│   │   └── ... - Server-side code running on AWS Lambda
│   ├── App.tsx - The web application's root component.
│   └── ... - Other files used by the application
│
├── test/
│   ├── system/    ... system tests for the API.
│   │   └── .jest/ ... Jest configuration for the system tests
│   ├── unit/      ... unit tests.
│   │   └── .jest/ ... Jest configuration for the unit tests
|   ├── jest.common.config.js - common Jest configuration for the unit and system tests.
|   ├── jestFileTransform.mjs - file transformation functions to allow Jest to test image files (.png,.jpeg).
|   └── jestMatcherSetup.mjs  - extended Jest matchers to support matching JSON objects.
│
├── handler.ts - AWS Lambda function handler
├── serverless.yml - Project configuration
├── tsconfig.json - TypeScript configuration for the source files
├── tsconfig-test.json - TypeScript configuration to include the test files
├── babel.config.mjs - Babel configuration
├── webpack.browser.config.js - Webpack configuration for client-side code
├── webpack.server.config.js  - Webpack configuration for the Lambda backend
└── ...
```

### Serverless

The project is based on the [Serverless Framework](https://serverless.com) and makes use of several plugins:

- [Webpack Plugin](https://github.com/serverless-heaven/serverless-webpack) - We use Webpack for packaging our sources.
- [Offline Plugin](https://github.com/dherault/serverless-offline) - The Serverless Offline Plugin allows you to run Serverless applications locally as if they would be deployed on AWS. This is especially helpful for testing web applications and APIs without having to deploy them anywhere.
- [Scripts Plugin](https://github.com/mvila/serverless-plugin-scripts#readme) - Run shell scripts as part of your Serverless workflow
- [S3 Deploy Plugin](https://github.com/funkybob/serverless-s3-deploy) - Deploy files to S3 buckets. This is used for uploading static content like images and the generated `main.js`.

### Webpack

Though we use the same source code for both the server-side and browser rendering, the project will be packaged into two distinct bundles:

1. Backend code running on AWS Lambda. The main entry point is `./src/server/render.tsx`. It contains the handler function that is invoked by AWS Lambda. The packaging is controlled by `webpack.server.config.js`.
2. Frontend code hosted in an S3 bucket and loaded by the browser. Main entry point is `./src/browser/index.tsx`. It's packaged using the `webpack.browser.config.js`, optimized for web browsers. The output files will have their content hash added to their names to enable long-term caching in the browser.

#### Code Splitting

`webpack.browser.config.js` defines some default code-splitting settings that optimize browser loading times and should make sense for most projects:

- Shared components (in the `src/components` folder) are loaded in a separate `components.js` chunk.
- All external Node modules (in the `node_modules/` folder) are loaded in the `vendor.js` chunk. External modules usually don't change as often as the rest of your application and this split will improve browser caching for your users.
- The rest of the application is loaded in the `main.js` chunk.

## Testing

You can test the setup locally. No direct access to AWS is needed. This allows developers to write and test code even if not everyone has full deployment access.

For local testing run the following command and open your web browser at http://localhost:13003/gip_edit/. Static content such as images will be served via the [Webpack DevServer](https://webpack.js.org/configuration/dev-server/) running on http://localhost:8082. Note that the app has to be deployed first before you will be able to run locally.

```sh
npm start
```

Testing is set up as well, using Jest and will execute all `*.test.ts` and `*.test.tsx` files in the `test/unit` directory:

```sh
npm run test-unit
```

The whole application can be deployed with a single command, once GIP_DOMAIN is set to the deployment domain, e.g., 'domain.com':

```sh
npx sls deploy
```

And finally to remove all AWS resources again run:

```sh
npx sls remove
```

This will delete all resources but the distribution S3 bucket. As it still contains the bundles you will have to delete the bucket manually for now.
