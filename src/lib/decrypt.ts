import crypto from 'crypto'

const algorithm = 'aes-256-cbc';

function base64UrlDecode(str: string): Buffer {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) base64 += '=';
  return Buffer.from(base64, 'base64');
}

export function decryptFromUrl(encryptedUrlSafe: string): string {

  const hashKey = process.env.NEXT_PUBLIC_KEY

  if (!hashKey)
    throw new Error('NEXT_PUBLIC_KEY is required')

  const secretKey = crypto
    .createHash('sha256')
    .update(hashKey) // Use your actual secret here
    .digest();
  const iv = Buffer.alloc(16, 0);

  const encryptedData = base64UrlDecode(encryptedUrlSafe);
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  return decrypted.toString('utf8');
}

export function getQueryParam(url: string, key: string): string | null {
  try {
    const urlObj = new URL(`?${url}`, 'http://dummybase.com');
    return urlObj.searchParams.get(key);
  } catch (err) {
    console.error('Invalid URL:', err);
    return null;
  }
}
