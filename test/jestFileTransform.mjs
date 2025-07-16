/**
 * File:        test/jestFileTransform.mjs
 * Description: File transform function to allow Jest to import file types that are unsupported, see https://jestjs.io/docs/code-transformation.
 *              Processes files:
 *               .png;
 *               .svg;
 *               .jpg,.jpeg.
 *
 * Usage:       Add the following to the jest config file:
 *                transform: {
 *                  '\\.tsx?$':           'ts-jest',
 *                  '\\.(jpg|jpeg|png)$': '<rootDir>/test/jestFileTransform.mjs',
 *                },
 *              NOTE: adding the "transform" option to the jest config disables default transformations, so also need to add the typescript transformation.
 */
import fs   from 'node:fs';
import path from 'node:path';

/**
 * @description Transform the file data to an encoded string. Taken from https://www.npmjs.com/package/jest-transform-file
 * @param pathname : pathname of the file to transform.
 * @param data     : the contents of the file.
 * @return a string in the format, e.g., 'date:image/png;base64.1ax61dasd...
 */
const base64 = (pathname, data) => {
  const extname = path.extname( pathname ).substring(1) || 'png';
  if (extname === 'svg') extname = 'svg+xml';
  return 'data:image/' + extname + ';base64,' + data.toString('base64');
};

export default {
	 process(fileContent, filePath, jestConfig) {
		const data = base64(filePath, fs.readFileSync(filePath));
		return { code: JSON.stringify(data) };
	}
}
