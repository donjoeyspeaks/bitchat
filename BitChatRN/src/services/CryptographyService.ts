/**
 * Cryptography Service for BitChat React Native
 * Cross-platform encryption, key exchange, and digital signatures
 */

import 'react-native-get-random-values'; // Must be first import for React Native
import { ed25519 } from '@noble/curves/ed25519';
import { x25519 } from '@noble/curves/ed25519';
import { sha256 } from '@noble/hashes/sha256';
import { randomBytes as nobleRandomBytes } from '@noble/hashes/utils';
import { CryptoKeys, EncryptedPayload } from '../types';

// Create a wrapper function for randomBytes to match expected signature
const randomBytes = (length: number): Uint8Array => {
  return nobleRandomBytes(length);
};

export class CryptographyService {
  private static instance: CryptographyService;
  private keyPair: CryptoKeys | null = null;

  static getInstance(): CryptographyService {
    if (!CryptographyService.instance) {
      CryptographyService.instance = new CryptographyService();
    }
    return CryptographyService.instance;
  }

  /**
   * Generate new Ed25519 key pair for signing
   */
  generateSigningKeyPair(): CryptoKeys {
    const privateKey = ed25519.utils.randomPrivateKey();
    const publicKey = ed25519.getPublicKey(privateKey);

    return {
      privateKey,
      publicKey,
    };
  }

  /**
   * Generate new X25519 key pair for key exchange
   */
  generateKeyExchangePair(): CryptoKeys {
    const privateKey = x25519.utils.randomPrivateKey();
    const publicKey = x25519.getPublicKey(privateKey);

    return {
      privateKey,
      publicKey,
    };
  }

  /**
   * Set the current key pair
   */
  setKeyPair(keyPair: CryptoKeys): void {
    this.keyPair = keyPair;
  }

  /**
   * Get the current key pair
   */
  getKeyPair(): CryptoKeys | null {
    return this.keyPair;
  }

  /**
   * Perform X25519 key exchange to derive shared secret
   */
  performKeyExchange(ourPrivateKey: Uint8Array, theirPublicKey: Uint8Array): Uint8Array {
    return x25519.getSharedSecret(ourPrivateKey, theirPublicKey);
  }

  /**
   * Derive AES key from shared secret using HKDF
   */
  async deriveAESKey(sharedSecret: Uint8Array, salt?: Uint8Array): Promise<CryptoKey> {
    // Import shared secret as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      sharedSecret,
      'HKDF',
      false,
      ['deriveKey']
    );

    // Derive AES-256-GCM key
    return crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: salt || new Uint8Array(32), // 32-byte salt
        info: new TextEncoder().encode('BitChat AES Key'),
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256,
      },
      false, // Not extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  async encryptAES(data: Uint8Array, key: CryptoKey): Promise<EncryptedPayload> {
    const nonce = randomBytes(12); // 96-bit nonce for GCM

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: nonce,
      },
      key,
      data
    );

    // Extract authentication tag (last 16 bytes)
    const ciphertextArray = new Uint8Array(ciphertext);
    const tag = ciphertextArray.slice(-16);
    const actualCiphertext = ciphertextArray.slice(0, -16);

    return {
      ciphertext: actualCiphertext,
      nonce,
      tag,
      algorithm: 'AES-256-GCM',
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  async decryptAES(payload: EncryptedPayload, key: CryptoKey): Promise<Uint8Array | null> {
    try {
      // Combine ciphertext and tag
      const combined = new Uint8Array(payload.ciphertext.length + payload.tag.length);
      combined.set(payload.ciphertext, 0);
      combined.set(payload.tag, payload.ciphertext.length);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: payload.nonce,
        },
        key,
        combined
      );

      return new Uint8Array(decrypted);
    } catch (error) {
      console.error('AES decryption failed:', error);
      return null;
    }
  }

  /**
   * Sign data using Ed25519
   */
  signData(data: Uint8Array, privateKey: Uint8Array): Uint8Array {
    return ed25519.sign(data, privateKey);
  }

  /**
   * Verify Ed25519 signature
   */
  verifySignature(data: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): boolean {
    try {
      return ed25519.verify(signature, data, publicKey);
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Generate public key fingerprint (for persistent identification)
   */
  generatePublicKeyFingerprint(publicKey: Uint8Array): string {
    const hash = sha256(publicKey);
    return Array.from(hash.slice(0, 8))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Derive channel key from password using Argon2id (simplified version)
   */
  async deriveChannelKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    // In production, use proper Argon2id implementation
    // For now, use PBKDF2 as fallback
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000, // In production, use Argon2id with proper parameters
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256,
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate random salt
   */
  generateSalt(length: number = 32): Uint8Array {
    return randomBytes(length);
  }

  /**
   * Hash data using SHA-256
   */
  hash(data: Uint8Array): Uint8Array {
    return sha256(data);
  }

  /**
   * Generate commitment for channel key verification
   */
  generateKeyCommitment(key: CryptoKey): Promise<string> {
    // In production, export key and hash it
    // For now, generate a random commitment
    const commitment = randomBytes(32);
    return Promise.resolve(Array.from(commitment)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''));
  }

  /**
   * Verify key commitment
   */
  async verifyKeyCommitment(key: CryptoKey, commitment: string): Promise<boolean> {
    // In production, export key, hash it, and compare
    // For now, always return true (mock implementation)
    return true;
  }

  /**
   * Generate dummy data for cover traffic
   */
  generateDummyData(length: number): Uint8Array {
    return randomBytes(length);
  }

  /**
   * Constant-time comparison to prevent timing attacks
   */
  constantTimeEquals(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }

    return result === 0;
  }

  /**
   * Secure memory wipe (best effort in JavaScript)
   */
  secureWipe(data: Uint8Array): void {
    // Fill with random data multiple times
    for (let pass = 0; pass < 3; pass++) {
      const random = randomBytes(data.length);
      data.set(random);
    }

    // Fill with zeros
    data.fill(0);
  }

  /**
   * Convert bytes to hex string
   */
  bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Convert hex string to bytes
   */
  hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  /**
   * Generate peer ID from public key
   */
  generatePeerID(publicKey: Uint8Array): Uint8Array {
    const hash = sha256(publicKey);
    return hash.slice(0, 8); // First 8 bytes as peer ID
  }

  /**
   * Validate key formats
   */
  validatePublicKey(publicKey: Uint8Array, keyType: 'ed25519' | 'x25519'): boolean {
    const expectedLength = keyType === 'ed25519' ? 32 : 32;
    return publicKey.length === expectedLength;
  }

  /**
   * Validate private key formats
   */
  validatePrivateKey(privateKey: Uint8Array, keyType: 'ed25519' | 'x25519'): boolean {
    const expectedLength = keyType === 'ed25519' ? 32 : 32;
    return privateKey.length === expectedLength;
  }
}
