import { exec } from 'child_process';
import * as os from 'os';

/**
 * Sends GET request using OS commanders
 *
 * - PowerShell (Windows)
 * - Bash (Others)
 * @param url URL
 */
export async function request(url: string) {
  return new Promise<string>((resolve, reject) => {
    if (os.platform() === 'win32') {
      exec(`Write-Output (Invoke-WebRequest -Uri ${url}).Content`, { shell: 'powershell' }, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    } else {
      exec(`curl ${url}`, { shell: 'bash' }, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    }
  });
}
