/**
 * Mock Cryptography Service for BitChat React Native
 * Simplified implementation for initial setup
 * TODO: Replace with proper cryptographic libraries in production
 */

import { CryptoKeys, EncryptedPayload } from '../types';

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
   * Generate random bytes (mock implementation)
   */
  private getRandomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    return bytes;
  }

  /**
   * Simple hash function (SHA-256 substitute)
   */
  private simpleHash(data: Uint8Array): Uint8Array {
    // Very basic hash - replace with proper SHA-256 in production
    const hash = new Uint8Array(32);
    let h = 0;
    for (let i = 0; i < data.length; i++) {
      h = ((h << 5) - h + data[i]) & 0xffffffff;
    }
    
    // Fill hash array with derived values
    for (let i = 0; i < 32; i++) {
      hash[i] = (h >> (i % 24)) & 0xff;
      h = ((h << 3) - h + i) & 0xffffffff;
    }
    
    return hash;
  }

  /**
   * Generate new key pair (mock implementation)
   */
  generateSigningKeyPair(): CryptoKeys {
    const privateKey = this.getRandomBytes(32);
    const publicKey = this.simpleHash(privateKey); // Derive public from private

    return {
      privateKey,
      publicKey,
    };
  }

  /**
   * Generate new X25519 key pair for key exchange (mock)
   */
  generateKeyExchangePair(): CryptoKeys {
    return this.generateSigningKeyPair(); // Same implementation for now
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
   * Perform key exchange (mock)
   */
  performKeyExchange(ourPrivateKey: Uint8Array, theirPublicKey: Uint8Array): Uint8Array {
    // Simple XOR for demonstration - use proper ECDH in production
    const shared = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      shared[i] = ourPrivateKey[i % ourPrivateKey.length] ^ theirPublicKey[i % theirPublicKey.length];
    }
    return this.simpleHash(shared);
  }

  /**
   * Derive AES key from shared secret (mock)
   */
  async deriveAESKey(sharedSecret: Uint8Array, salt?: Uint8Array): Promise<CryptoKey> {
    // Mock implementation - just return a CryptoKey
    const keyData = this.simpleHash(sharedSecret);
    
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data using AES-256-GCM (mock)
   */
  async encryptAES(data: Uint8Array, key: CryptoKey): Promise<EncryptedPayload> {
    const nonce = this.getRandomBytes(12);
    
    try {
      const ciphertext = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: nonce,
        },
        key,
        data
      );

      const ciphertextArray = new Uint8Array(ciphertext);
      const tag = ciphertextArray.slice(-16);
      const actualCiphertext = ciphertextArray.slice(0, -16);

      return {
        ciphertext: actualCiphertext,
        nonce,
        tag,
        algorithm: 'AES-256-GCM',
      };
    } catch (error) {
      // Fallback to simple XOR encryption
      const encrypted = new Uint8Array(data.length);
      const keyBytes = this.getRandomBytes(data.length);
      for (let i = 0; i < data.length; i++) {
        encrypted[i] = data[i] ^ keyBytes[i % 32];
      }
      
      return {
        ciphertext: encrypted,
        nonce,
        tag: this.getRandomBytes(16),
        algorithm: 'AES-256-GCM',
      };
    }
  }

  /**
   * Decrypt data using AES-256-GCM (mock)
   */
  async decryptAES(payload: EncryptedPayload, key: CryptoKey): Promise<Uint8Array | null> {
    try {
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
      console.warn('AES decryption failed, using fallback');
      // Fallback - just return the ciphertext (mock)
      return payload.ciphertext;
    }
  }

  /**
   * Sign data (mock implementation)
   */
  signData(data: Uint8Array, privateKey: Uint8Array): Uint8Array {
    // Simple signing - combine data hash with private key hash
    const dataHash = this.simpleHash(data);
    const combined = new Uint8Array(dataHash.length + privateKey.length);
    combined.set(dataHash, 0);
    combined.set(privateKey, dataHash.length);
    
    return this.simpleHash(combined).slice(0, 64); // 64-byte signature
  }

  /**
   * Verify signature (mock implementation)
   */
  verifySignature(data: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): boolean {
    // Mock verification - always returns true for valid length signatures
    return signature.length === 64 && publicKey.length === 32;
  }

  /**
   * Generate public key fingerprint
   */
  generatePublicKeyFingerprint(publicKey: Uint8Array): string {
    const hash = this.simpleHash(publicKey);
    return Array.from(hash.slice(0, 8))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Derive channel key from password
   */
  async deriveChannelKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
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
        iterations: 100000,
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
    return this.getRandomBytes(length);
  }

  /**
   * Hash data
   */
  hash(data: Uint8Array): Uint8Array {
    return this.simpleHash(data);
  }

  /**
   * Generate key commitment
   */
  generateKeyCommitment(key: CryptoKey): Promise<string> {
    const commitment = this.getRandomBytes(32);
    return Promise.resolve(Array.from(commitment)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''));
  }

  /**
   * Verify key commitment
   */
  async verifyKeyCommitment(key: CryptoKey, commitment: string): Promise<boolean> {
    return commitment.length === 64; // Mock verification
  }

  /**
   * Generate dummy data for cover traffic
   */
  generateDummyData(length: number): Uint8Array {
    return this.getRandomBytes(length);
  }

  /**
   * Constant-time comparison
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
   * Secure memory wipe
   */
  secureWipe(data: Uint8Array): void {
    for (let pass = 0; pass < 3; pass++) {
      const random = this.getRandomBytes(data.length);
      data.set(random);
    }
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
    const hash = this.simpleHash(publicKey);
    return hash.slice(0, 8);
  }

  /**
   * Validate key formats
   */
  validatePublicKey(publicKey: Uint8Array, keyType: 'ed25519' | 'x25519'): boolean {
    return publicKey.length === 32;
  }

  validatePrivateKey(privateKey: Uint8Array, keyType: 'ed25519' | 'x25519'): boolean {
    return privateKey.length === 32;
  }
}
