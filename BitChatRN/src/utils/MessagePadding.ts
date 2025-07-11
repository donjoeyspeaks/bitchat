/**
 * Message Padding Utilities for BitChat
 * Privacy-preserving padding to obfuscate message sizes
 */

export class MessagePadding {
  // Standard block sizes for padding (in bytes)
  private static readonly BLOCK_SIZES = [256, 512, 1024, 2048, 4096];
  private static readonly MAX_PADDING = 255; // PKCS#7 limitation

  /**
   * Add PKCS#7-style padding to reach target size
   */
  static pad(data: Uint8Array, targetSize: number): Uint8Array {
    if (data.length >= targetSize) {
      return data; // Already at or above target size
    }

    const paddingNeeded = targetSize - data.length;

    // PKCS#7 only supports padding up to 255 bytes
    if (paddingNeeded > this.MAX_PADDING) {
      return data; // Can't pad this much with PKCS#7
    }

    // Create padded array
    const padded = new Uint8Array(targetSize);
    
    // Copy original data
    padded.set(data, 0);
    
    // Fill with random bytes (all but the last byte)
    if (paddingNeeded > 1) {
      const randomBytes = this.getRandomBytes(paddingNeeded - 1);
      padded.set(randomBytes, data.length);
    }
    
    // Last byte indicates padding length (PKCS#7 standard)
    padded[targetSize - 1] = paddingNeeded;

    return padded;
  }

  /**
   * Remove PKCS#7 padding from data
   */
  static unpad(data: Uint8Array): Uint8Array {
    if (data.length === 0) {
      return data;
    }

    // Last byte tells us how much padding to remove
    const paddingLength = data[data.length - 1];
    
    // Validate padding length
    if (paddingLength <= 0 || paddingLength > data.length || paddingLength > this.MAX_PADDING) {
      return data; // Invalid padding, return original
    }

    // Verify this is valid PKCS#7 padding (optional, for security)
    if (this.isValidPKCS7Padding(data, paddingLength)) {
      return data.slice(0, data.length - paddingLength);
    }

    return data; // Invalid padding, return original
  }

  /**
   * Find optimal block size for data
   */
  static getOptimalBlockSize(dataSize: number): number {
    // Account for encryption overhead (~16 bytes for AES-GCM tag)
    const totalSize = dataSize + 16;

    // Find smallest block that fits
    for (const blockSize of this.BLOCK_SIZES) {
      if (totalSize <= blockSize) {
        return blockSize;
      }
    }

    // For very large messages, don't pad (will be fragmented anyway)
    return dataSize;
  }

  /**
   * Pad message to optimal block size
   */
  static padToOptimalSize(data: Uint8Array): Uint8Array {
    const optimalSize = this.getOptimalBlockSize(data.length);
    if (optimalSize <= data.length) {
      return data; // No padding needed
    }
    return this.pad(data, optimalSize);
  }

  /**
   * Add privacy padding with random target size
   */
  static addPrivacyPadding(data: Uint8Array, minPadding: number = 0, maxPadding: number = 64): Uint8Array {
    const randomPadding = Math.floor(Math.random() * (maxPadding - minPadding + 1)) + minPadding;
    const targetSize = data.length + randomPadding;
    
    // Ensure we don't exceed PKCS#7 limits
    const actualTarget = Math.min(targetSize, data.length + this.MAX_PADDING);
    
    return this.pad(data, actualTarget);
  }

  /**
   * Generate cryptographically secure random bytes
   */
  private static getRandomBytes(length: number): Uint8Array {
    // In React Native, use react-native-get-random-values
    // For now, use a simple implementation
    const bytes = new Uint8Array(length);
    
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      // Browser/modern environment
      crypto.getRandomValues(bytes);
    } else {
      // Fallback to Math.random (not cryptographically secure)
      for (let i = 0; i < length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    
    return bytes;
  }

  /**
   * Validate PKCS#7 padding
   */
  private static isValidPKCS7Padding(data: Uint8Array, paddingLength: number): boolean {
    if (paddingLength <= 0 || paddingLength > data.length) {
      return false;
    }

    // Check if all padding bytes have the correct value
    for (let i = data.length - paddingLength; i < data.length; i++) {
      if (data[i] !== paddingLength) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate padding overhead for a given data size
   */
  static calculatePaddingOverhead(dataSize: number): number {
    const optimalSize = this.getOptimalBlockSize(dataSize);
    return Math.max(0, optimalSize - dataSize);
  }

  /**
   * Check if data appears to be padded
   */
  static isPadded(data: Uint8Array): boolean {
    if (data.length === 0) return false;
    
    const lastByte = data[data.length - 1];
    if (lastByte <= 0 || lastByte > this.MAX_PADDING || lastByte > data.length) {
      return false;
    }

    return this.isValidPKCS7Padding(data, lastByte);
  }

  /**
   * Get padding statistics
   */
  static getPaddingStats(originalSize: number, paddedSize: number): {
    originalSize: number;
    paddedSize: number;
    overhead: number;
    efficiency: number;
  } {
    const overhead = paddedSize - originalSize;
    const efficiency = originalSize / paddedSize;

    return {
      originalSize,
      paddedSize,
      overhead,
      efficiency,
    };
  }
}
