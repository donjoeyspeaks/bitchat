/**
 * Compression utilities for BitChat
 * LZ4-based compression for message payloads to save bandwidth
 */

// Note: In a real implementation, you would use react-native-lz4 or similar
// For now, we'll implement a simple compression check and mock compression

export class CompressionUtil {
  private static readonly COMPRESSION_THRESHOLD = 128; // Compress if payload > 128 bytes
  private static readonly MIN_COMPRESSION_RATIO = 0.9; // Must achieve at least 10% compression

  /**
   * Check if data should be compressed
   */
  static shouldCompress(data: Uint8Array): boolean {
    // Only compress if data is large enough
    if (data.length < this.COMPRESSION_THRESHOLD) {
      return false;
    }

    // Simple entropy check - if data has low entropy, compression might be beneficial
    const entropy = this.calculateEntropy(data);
    return entropy < 7.5; // Arbitrary threshold - lower entropy = more compressible
  }

  /**
   * Compress data using LZ4 algorithm
   * Note: This is a mock implementation. In production, use react-native-lz4
   */
  static compress(data: Uint8Array): Uint8Array | null {
    try {
      // Mock compression - in real implementation, use LZ4
      // For now, just return a simulated compressed version
      if (!this.shouldCompress(data)) {
        return null;
      }

      // Simulate compression by removing duplicate bytes (very simple)
      const compressed: number[] = [];
      let lastByte = -1;
      let count = 0;

      for (let i = 0; i < data.length; i++) {
        const currentByte = data[i];

        if (currentByte === lastByte && count < 255) {
          count++;
        } else {
          if (count > 0) {
            // Write run-length encoded data
            compressed.push(0xFF); // Escape byte
            compressed.push(lastByte);
            compressed.push(count);
          }

          if (currentByte !== 0xFF) {
            compressed.push(currentByte);
          } else {
            // Escape the escape byte
            compressed.push(0xFF);
            compressed.push(0xFF);
            compressed.push(1);
          }

          lastByte = currentByte;
          count = 1;
        }
      }

      // Write final run
      if (count > 0) {
        compressed.push(0xFF);
        compressed.push(lastByte);
        compressed.push(count);
      }

      const result = new Uint8Array(compressed);

      // Only return if we achieved meaningful compression
      if (result.length >= data.length * this.MIN_COMPRESSION_RATIO) {
        return null;
      }

      return result;
    } catch (error) {
      console.error('Compression error:', error);
      return null;
    }
  }

  /**
   * Decompress LZ4 compressed data
   * Note: This is a mock implementation
   */
  static decompress(compressedData: Uint8Array, originalSize: number): Uint8Array | null {
    try {
      // Mock decompression - reverse of the simple compression above
      const decompressed: number[] = [];
      let i = 0;

      while (i < compressedData.length && decompressed.length < originalSize) {
        const byte = compressedData[i];

        if (byte === 0xFF && i + 2 < compressedData.length) {
          // Run-length encoded data
          const value = compressedData[i + 1];
          const count = compressedData[i + 2];

          for (let j = 0; j < count && decompressed.length < originalSize; j++) {
            decompressed.push(value);
          }

          i += 3;
        } else {
          decompressed.push(byte);
          i++;
        }
      }

      return new Uint8Array(decompressed);
    } catch (error) {
      console.error('Decompression error:', error);
      return null;
    }
  }

  /**
   * Calculate Shannon entropy of data
   */
  private static calculateEntropy(data: Uint8Array): number {
    if (data.length === 0) return 0;

    // Count frequency of each byte value
    const freq = new Array(256).fill(0);
    for (let i = 0; i < data.length; i++) {
      freq[data[i]]++;
    }

    // Calculate entropy
    let entropy = 0;
    for (let i = 0; i < 256; i++) {
      if (freq[i] > 0) {
        const p = freq[i] / data.length;
        entropy -= p * Math.log2(p);
      }
    }

    return entropy;
  }

  /**
   * Estimate compression ratio without actually compressing
   */
  static estimateCompressionRatio(data: Uint8Array): number {
    const entropy = this.calculateEntropy(data);
    // Rough estimate based on entropy
    // Lower entropy = better compression
    return Math.max(0.1, Math.min(1.0, entropy / 8.0));
  }

  /**
   * Get compression statistics
   */
  static getCompressionStats(original: Uint8Array, compressed: Uint8Array | null): {
    originalSize: number;
    compressedSize: number;
    ratio: number;
    savings: number;
  } {
    const originalSize = original.length;
    const compressedSize = compressed ? compressed.length : originalSize;
    const ratio = compressedSize / originalSize;
    const savings = originalSize - compressedSize;

    return {
      originalSize,
      compressedSize,
      ratio,
      savings,
    };
  }
}
