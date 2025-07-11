/**
 * Binary Protocol Implementation for BitChat React Native
 * Cross-platform binary message encoding/decoding with compression support
 * 
 * Protocol Format:
 * Header (Fixed 13 bytes):
 * - Version: 1 byte
 * - Type: 1 byte  
 * - TTL: 1 byte
 * - Timestamp: 8 bytes (BigInt, big-endian)
 * - Flags: 1 byte (hasRecipient, hasSignature, isCompressed, isBSVRelated)
 * - PayloadLength: 2 bytes (big-endian)
 *
 * Variable sections:
 * - SenderID: 8 bytes (fixed)
 * - RecipientID: 8 bytes (if hasRecipient flag set)
 * - Payload: Variable length (compressed if beneficial)
 * - OriginalSize: 2 bytes (if compressed)
 * - Signature: 64 bytes (if hasSignature flag set)
 */

import { BitchatPacket, MessageType, PROTOCOL_CONSTANTS } from '../types';
import { CompressionUtil } from '../utils/CompressionUtil';

export class BinaryProtocol {
    private static readonly HEADER_SIZE = PROTOCOL_CONSTANTS.HEADER_SIZE;
    private static readonly SENDER_ID_SIZE = PROTOCOL_CONSTANTS.SENDER_ID_SIZE;
    private static readonly RECIPIENT_ID_SIZE = PROTOCOL_CONSTANTS.RECIPIENT_ID_SIZE;
    private static readonly SIGNATURE_SIZE = PROTOCOL_CONSTANTS.SIGNATURE_SIZE;

    // Flag bit positions
    private static readonly FLAGS = {
        HAS_RECIPIENT: 0x01,
        HAS_SIGNATURE: 0x02,
        IS_COMPRESSED: 0x04,
        IS_BSV_RELATED: 0x08, // New flag for BSV-related messages
    } as const;

    /**
     * Encode a BitchatPacket to binary format
     */
    static encode(packet: BitchatPacket): Uint8Array | null {
        try {
            const data: number[] = [];

            // Try to compress payload if beneficial
            let payload = new Uint8Array(packet.payload);
            let originalPayloadSize: number | null = null;
            let isCompressed = false;

            if (CompressionUtil.shouldCompress(payload)) {
                const compressedPayload = CompressionUtil.compress(payload);
                if (compressedPayload && compressedPayload.length < payload.length) {
                    originalPayloadSize = payload.length;
                    payload = compressedPayload;
                    isCompressed = true;
                }
            }

            // Header - Version (1 byte)
            data.push(packet.version);

            // Type (1 byte)
            data.push(packet.type);

            // TTL (1 byte)
            data.push(packet.ttl);

            // Timestamp (8 bytes, big-endian)
            const timestamp = BigInt(packet.timestamp);
            for (let i = 7; i >= 0; i--) {
                data.push(Number((timestamp >> BigInt(i * 8)) & BigInt(0xFF)));
            }

            // Flags (1 byte)
            let flags = 0;
            if (packet.recipientID) {
                flags |= this.FLAGS.HAS_RECIPIENT;
            }
            if (packet.signature) {
                flags |= this.FLAGS.HAS_SIGNATURE;
            }
            if (isCompressed) {
                flags |= this.FLAGS.IS_COMPRESSED;
            }
            if (packet.flags.isBSVRelated) {
                flags |= this.FLAGS.IS_BSV_RELATED;
            }
            data.push(flags);

            // Payload length (2 bytes, big-endian) - includes original size if compressed
            const payloadDataSize = payload.length + (isCompressed ? 2 : 0);
            const payloadLength = payloadDataSize;
            data.push((payloadLength >> 8) & 0xFF);
            data.push(payloadLength & 0xFF);

            // SenderID (exactly 8 bytes)
            const senderBytes = packet.senderID.slice(0, this.SENDER_ID_SIZE);
            data.push(...Array.from(senderBytes));
            if (senderBytes.length < this.SENDER_ID_SIZE) {
                // Pad with zeros
                data.push(...new Array(this.SENDER_ID_SIZE - senderBytes.length).fill(0));
            }

            // RecipientID (8 bytes, if present)
            if (packet.recipientID) {
                const recipientBytes = packet.recipientID.slice(0, this.RECIPIENT_ID_SIZE);
                data.push(...Array.from(recipientBytes));
                if (recipientBytes.length < this.RECIPIENT_ID_SIZE) {
                    data.push(...new Array(this.RECIPIENT_ID_SIZE - recipientBytes.length).fill(0));
                }
            }

            // Payload
            data.push(...Array.from(payload));

            // Original size (2 bytes, big-endian, if compressed)
            if (isCompressed && originalPayloadSize !== null) {
                data.push((originalPayloadSize >> 8) & 0xFF);
                data.push(originalPayloadSize & 0xFF);
            }

            // Signature (64 bytes, if present)
            if (packet.signature) {
                const signatureBytes = packet.signature.slice(0, this.SIGNATURE_SIZE);
                data.push(...Array.from(signatureBytes));
                if (signatureBytes.length < this.SIGNATURE_SIZE) {
                    data.push(...new Array(this.SIGNATURE_SIZE - signatureBytes.length).fill(0));
                }
            }

            return new Uint8Array(data);
        } catch (error) {
            console.error('BinaryProtocol encode error:', error);
            return null;
        }
    }

    /**
     * Decode binary data to a BitchatPacket
     */
    static decode(data: Uint8Array): BitchatPacket | null {
        try {
            if (data.length < this.HEADER_SIZE) {
                console.error('BinaryProtocol: Data too short for header');
                return null;
            }

            let offset = 0;

            // Parse header
            const version = data[offset++];
            const type = data[offset++];
            const ttl = data[offset++];

            // Timestamp (8 bytes, big-endian)
            let timestamp = BigInt(0);
            for (let i = 0; i < 8; i++) {
                timestamp = (timestamp << BigInt(8)) | BigInt(data[offset++]);
            }

            // Flags
            const flags = data[offset++];
            const hasRecipient = (flags & this.FLAGS.HAS_RECIPIENT) !== 0;
            const hasSignature = (flags & this.FLAGS.HAS_SIGNATURE) !== 0;
            const isCompressed = (flags & this.FLAGS.IS_COMPRESSED) !== 0;
            const isBSVRelated = (flags & this.FLAGS.IS_BSV_RELATED) !== 0;

            // Payload length (2 bytes, big-endian)
            const payloadLength = (data[offset] << 8) | data[offset + 1];
            offset += 2;

            // Validate remaining data length
            const expectedLength = this.SENDER_ID_SIZE +
                (hasRecipient ? this.RECIPIENT_ID_SIZE : 0) +
                payloadLength +
                (hasSignature ? this.SIGNATURE_SIZE : 0);

            if (data.length < this.HEADER_SIZE + expectedLength) {
                console.error('BinaryProtocol: Data length mismatch');
                return null;
            }

            // SenderID (8 bytes)
            const senderID = data.slice(offset, offset + this.SENDER_ID_SIZE);
            offset += this.SENDER_ID_SIZE;

            // RecipientID (8 bytes, if present)
            let recipientID: Uint8Array | undefined;
            if (hasRecipient) {
                recipientID = data.slice(offset, offset + this.RECIPIENT_ID_SIZE);
                offset += this.RECIPIENT_ID_SIZE;
            }

            // Payload (with potential decompression)
            let payload: Uint8Array;
            if (isCompressed) {
                // Compressed payload has original size at the end
                const compressedPayloadLength = payloadLength - 2;
                const compressedPayload = data.slice(offset, offset + compressedPayloadLength);
                offset += compressedPayloadLength;

                // Original size (2 bytes, big-endian)
                const originalSize = (data[offset] << 8) | data[offset + 1];
                offset += 2;

                // Decompress
                const decompressed = CompressionUtil.decompress(compressedPayload, originalSize);
                if (!decompressed) {
                    console.error('BinaryProtocol: Decompression failed');
                    return null;
                }
                payload = decompressed;
            } else {
                payload = data.slice(offset, offset + payloadLength);
                offset += payloadLength;
            }

            // Signature (64 bytes, if present)
            let signature: Uint8Array | undefined;
            if (hasSignature) {
                signature = data.slice(offset, offset + this.SIGNATURE_SIZE);
                offset += this.SIGNATURE_SIZE;
            }

            // Trim null bytes from IDs
            const trimmedSenderID = this.trimNullBytes(senderID);
            const trimmedRecipientID = recipientID ? this.trimNullBytes(recipientID) : undefined;

            return {
                version,
                type: type as MessageType,
                senderID: trimmedSenderID,
                recipientID: trimmedRecipientID,
                timestamp: Number(timestamp),
                payload,
                signature,
                ttl,
                flags: {
                    hasRecipient,
                    hasSignature,
                    isCompressed,
                    isBSVRelated,
                },
            };
        } catch (error) {
            console.error('BinaryProtocol decode error:', error);
            return null;
        }
    }

    /**
     * Validate packet integrity
     */
    static validate(packet: BitchatPacket): boolean {
        try {
            // Check version
            if (packet.version !== PROTOCOL_CONSTANTS.VERSION) {
                console.warn('BinaryProtocol: Unsupported version', packet.version);
                return false;
            }

            // Check TTL
            if (packet.ttl > PROTOCOL_CONSTANTS.MAX_TTL || packet.ttl < 0) {
                console.warn('BinaryProtocol: Invalid TTL', packet.ttl);
                return false;
            }

            // Check sender ID
            if (packet.senderID.length === 0 || packet.senderID.length > this.SENDER_ID_SIZE) {
                console.warn('BinaryProtocol: Invalid sender ID length');
                return false;
            }

            // Check recipient ID if present
            if (packet.recipientID && packet.recipientID.length > this.RECIPIENT_ID_SIZE) {
                console.warn('BinaryProtocol: Invalid recipient ID length');
                return false;
            }

            // Check payload size
            if (packet.payload.length > PROTOCOL_CONSTANTS.MAX_PAYLOAD_SIZE) {
                console.warn('BinaryProtocol: Payload too large');
                return false;
            }

            // Check signature size if present
            if (packet.signature && packet.signature.length !== this.SIGNATURE_SIZE) {
                console.warn('BinaryProtocol: Invalid signature length');
                return false;
            }

            // Check timestamp (not too far in future)
            const now = Date.now();
            const maxFutureTime = now + 300000; // 5 minutes in future
            if (packet.timestamp > maxFutureTime) {
                console.warn('BinaryProtocol: Timestamp too far in future');
                return false;
            }

            return true;
        } catch (error) {
            console.error('BinaryProtocol validation error:', error);
            return false;
        }
    }

    /**
     * Calculate total packet size
     */
    static calculatePacketSize(packet: BitchatPacket): number {
        let size = this.HEADER_SIZE + this.SENDER_ID_SIZE;

        if (packet.recipientID) {
            size += this.RECIPIENT_ID_SIZE;
        }

        size += packet.payload.length;

        if (packet.signature) {
            size += this.SIGNATURE_SIZE;
        }

        return size;
    }

    /**
     * Create a packet with TTL decremented
     */
    static decrementTTL(packet: BitchatPacket): BitchatPacket | null {
        if (packet.ttl <= 0) {
            return null; // Packet expired
        }

        return {
            ...packet,
            ttl: packet.ttl - 1,
        };
    }

    /**
     * Utility: Trim null bytes from the end of byte arrays
     */
    private static trimNullBytes(data: Uint8Array): Uint8Array {
        let lastNonNull = data.length - 1;
        while (lastNonNull >= 0 && data[lastNonNull] === 0) {
            lastNonNull--;
        }
        return data.slice(0, lastNonNull + 1);
    }

    /**
     * Generate a unique message ID from packet data
     */
    static generateMessageId(packet: BitchatPacket): string {
        const input = new Uint8Array([
            ...packet.senderID,
            ...new Uint8Array(new ArrayBuffer(8)).map((_, i) =>
                Number((BigInt(packet.timestamp) >> BigInt(i * 8)) & BigInt(0xFF))
            ),
            ...packet.payload.slice(0, 32), // First 32 bytes of payload
        ]);

        // Simple hash function (in production, use crypto hash)
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            hash = ((hash << 5) - hash + input[i]) & 0xffffffff;
        }

        return hash.toString(16);
    }
}
