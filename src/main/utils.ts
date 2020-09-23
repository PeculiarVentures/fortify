import { getProxySettings } from 'get-proxy-settings';
import * as request2 from 'request';

/**
 * Sends GET request
 * @param url URL
 */
export async function request(url: string, encoding = 'utf8') {
  const options: request2.CoreOptions = {
    encoding,
  };
  const proxySettings = await getProxySettings();
  if (proxySettings && proxySettings.https) {
    options.proxy = proxySettings.https.toString();
  }

  return new Promise<string>((resolve, reject) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";
    request2.get(url, options, (error: Error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
}

export const isDevelopment = process.env.NODE_ENV === 'development';
