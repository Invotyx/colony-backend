import { oneLine } from 'common-tags';
import { pbkdf2 } from 'crypto';
import { promisify } from 'util';

// import { createHash, HexBase64Latin1Encoding } from 'crypto';
// import * as argon2 from 'argon2';
// import * as argon2 from 'argon2-browser';

const salt = oneLine`50f82ac053aeba9d2eb12daff3f139b0cf9a251ec065721063f564
  c5bb23f33effc52ac7b934743d2d790fb0c924cbb419bea415de3c3
  6089e3014a8b802bc9003b21082b1d97faae26a7062551b028ba96c
  885e926a3317c2417fd4cb2d37a5b32ff9e7decaa89246b49ff910c
  f8ff13f651c89d45694e4cec8ad1e7af4255e`;
const secret =
  'kjGVINJ7f9hBLsQa=Z6lnSFrye4YAtpwXdmcEPiqb20CDgU513uKOT/W8+xRMozvH';

export class CustomEncryptEngine {
  static encrypt(base64: string) {
    const r = Math.floor(Math.random() * 256);
    return (
      base64
        .split('')
        .map((v) => secret[(secret.indexOf(v) + (r % 65)) % 65])
        .join('')
        .replace(/\//g, '_')
        .replace(/=/g, '-') + r.toString(16).padStart(2, '0')
    );
  }

  static decrypt(enc: string) {
    enc = enc.replace(/_/g, '/').replace(/-/g, '=');
    const hash = enc.slice(0, -2).split('');
    const r = Number('0x' + enc.slice(-2)) % 65;
    return hash.map((v) => secret[(secret.indexOf(v) - r + 65) % 65]).join('');
  }
}

const pbkdf2Hash = promisify(pbkdf2);
export class HashEngine {
  private async genHash(word: string) {
    // return (
    //   await argon2.hash(word, {
    //     version: 19,
    //     memoryCost: 4096,
    //     timeCost: 3,
    //     parallelism: 1,
    //   })
    // ).slice(28);
    // );

    return (await pbkdf2Hash(word, salt, 1e5, 32, `sha512`)).toString('base64');
  }

  async make(word: string) {
    return CustomEncryptEngine.encrypt(await this.genHash(word));
  }

  async check(key: string, hash: string) {
    // return await argon2.verify('$argon2i$v=19$m=4096,t=3,p=1' + hash, key);
    return (await this.genHash(key)) === CustomEncryptEngine.decrypt(hash);
  }
}

export const PasswordHashEngine = new HashEngine();
