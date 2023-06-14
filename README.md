# aws-gip-edit

## Overview

BBC Sounds program list editor in React.js and AWS Lambda.

Copied from the following project:
  https://github.com/arabold/serverless-react-boilerplate


### Folder Structure

```
serverless-react-boilerplate/
│
├── public/ - Public assets which will retain their original file names and folder structure
│   ├── favicon.ico - Favicon
│   └── manifest.json - Web page manifest
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
├── handler.ts - AWS Lambda function handler
├── serverless.yml - Project configuration
├── babel.config.js - Babel configuration
├── jest.config.js - Jest configuration
├── webpack.browser.config.js - Webpack configuration for client-side code
├── webpack.server.config.js - Webpack configuration for the Lambda backend
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

1. Backend code running on AWS Lambda. The main entry point is `./src/server/render.tsx`. It contains the handler function that is invoked by AWS Lambda. The packaging is controlled by `webpack.server.config.js` and optimized for Node.js 12.
2. Frontend code hosted in an S3 bucket and loaded by the browser. Main entry point is `./src/browser/index.tsx`. It's packaged using the `webpack.browser.config.js`, optimized for web browsers. The output files will have their content hash added to their names to enable long-term caching in the browser.

#### Code Splitting

`webpack.browser.config.js` defines some default code-splitting settings that optimize browser loading times and should make sense for most projects:

- Shared components (in the `src/components` folder) are loaded in a separate `components.js` chunk.
- All external Node modules (in the `node_modules/` folder) are loaded in the `vendor.js` chunk. External modules usually don't change as often as the rest of your application and this split will improve browser caching for your users.
- The rest of the application is loaded in the `main.js` chunk.

## Testing

You can test the setup locally. No direct access to AWS is needed. This allows developers to write and test code even if not everyone has full deployment access.

For local testing run the following command and open your web browser at http://localhost:3000/. Static content such as images will be served via the [Webpack DevServer](https://webpack.js.org/configuration/dev-server/) running on http://localhost:8080. Note that the app has to be deployed first before you will be able to run locally.

```sh
npm start
```

Testing is set up as well, using Jest and will execute all `*.test.ts` and `*.test.tsx` files in the `src/` directory:

```sh
npm test
```

The whole application can be deployed with a single command:

```sh
npx sls deploy
```

And finally to remove all AWS resources again run:

```sh
npx sls remove
```

This will delete all resources but the distribution S3 bucket. As it still contains the bundles you will have to delete the bucket manually for now.
