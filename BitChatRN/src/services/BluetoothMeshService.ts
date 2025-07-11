/**
 * Real Bluetooth Mesh Service for BitChat React Native
 * Cross-platform BLE mesh networking using react-native-ble-plx
 */

import { EventEmitter } from 'events';
import { BleManager, Device, Service, Characteristic, BleError } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import type { BitchatMessage } from '../types';

interface Peer {
    id: string;
    publicKey: string;
    lastSeen: Date;
    rssi?: number;
    deviceName?: string;
    peripheral?: Device;
}

interface BluetoothDevice {
    id: string;
    name?: string;
    rssi?: number;
    device?: Device;
}

// BitChat BLE Service UUID (custom UUID for our mesh network)
const BITCHAT_SERVICE_UUID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const MESSAGE_CHARACTERISTIC_UUID = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
const HANDSHAKE_CHARACTERISTIC_UUID = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';

class BluetoothMeshService extends EventEmitter {
    private bleManager: BleManager;
    private isScanning = false;
    private connectedPeers: Map<string, Peer> = new Map();
    private discoveredDevices: Map<string, BluetoothDevice> = new Map();
    private isInitialized = false;

    constructor() {
        super();
        this.bleManager = new BleManager();
    }

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Request permissions for Android
            if (Platform.OS === 'android') {
                await this.requestAndroidPermissions();
            }

            // Check if Bluetooth is enabled
            const state = await this.bleManager.state();
            console.log('BLE State:', state);

            if (state !== 'PoweredOn') {
                throw new Error('Bluetooth is not enabled');
            }

            this.isInitialized = true;
            console.log('BluetoothMeshService initialized successfully');
        } catch (error) {
            console.error('Failed to initialize BLE:', error);
            throw error;
        }
    }

    private async requestAndroidPermissions(): Promise<void> {
        const permissions = [
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ];

        // For Android 12+
        if (typeof Platform.Version === 'number' && Platform.Version >= 31) {
            permissions.push(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE
            );
        }

        const granted = await PermissionsAndroid.requestMultiple(permissions);

        for (const permission of permissions) {
            if (granted[permission] !== PermissionsAndroid.RESULTS.GRANTED) {
                throw new Error(`Permission ${permission} not granted`);
            }
        }
    }

    async startScanning(): Promise<void> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (this.isScanning) {
            console.log('Already scanning...');
            return;
        }

        console.log('Starting BLE scanning for BitChat devices...');
        this.isScanning = true;

        try {
            this.bleManager.startDeviceScan(
                [BITCHAT_SERVICE_UUID], // Only scan for BitChat devices
                { allowDuplicates: false },
                (error: BleError | null, device: Device | null) => {
                    if (error) {
                        console.error('Scan error:', error);
                        this.emit('scanError', error);
                        return;
                    }

                    if (device && device.name) {
                        console.log(`Discovered BitChat device: ${device.name} (${device.id})`);

                        const bluetoothDevice: BluetoothDevice = {
                            id: device.id,
                            name: device.name,
                            rssi: device.rssi || undefined,
                            device
                        };

                        this.discoveredDevices.set(device.id, bluetoothDevice);
                        this.emit('deviceDiscovered', bluetoothDevice);
                    }
                }
            );
        } catch (error) {
            console.error('Failed to start scanning:', error);
            this.isScanning = false;
            throw error;
        }
    }

    async stopScanning(): Promise<void> {
        if (!this.isScanning) return;

        console.log('Stopping BLE scanning...');
        this.bleManager.stopDeviceScan();
        this.isScanning = false;
    }

    async connectToPeer(deviceId: string, publicKey: string): Promise<void> {
        const discoveredDevice = this.discoveredDevices.get(deviceId);
        if (!discoveredDevice?.device) {
            throw new Error('Device not found');
        }

        console.log(`Connecting to BitChat peer: ${deviceId}`);

        try {
            // Connect to the device
            const connectedDevice = await this.bleManager.connectToDevice(deviceId);

            // Discover services and characteristics
            await connectedDevice.discoverAllServicesAndCharacteristics();

            // Verify BitChat service exists
            const services = await connectedDevice.services();
            const bitchatService = services.find(s => s.uuid === BITCHAT_SERVICE_UUID);

            if (!bitchatService) {
                throw new Error('BitChat service not found on device');
            }

            // Create peer object
            const peer: Peer = {
                id: deviceId,
                publicKey,
                lastSeen: new Date(),
                rssi: discoveredDevice.rssi,
                deviceName: discoveredDevice.name,
                peripheral: connectedDevice
            };

            // Perform handshake
            await this.performHandshake(connectedDevice, publicKey);

            // Setup message monitoring
            await this.setupMessageMonitoring(connectedDevice);

            this.connectedPeers.set(deviceId, peer);
            this.emit('peerConnected', peer);

            console.log(`Successfully connected to peer: ${deviceId}`);
        } catch (error) {
            console.error(`Failed to connect to peer ${deviceId}:`, error);
            throw error;
        }
    }

    private async performHandshake(device: Device, publicKey: string): Promise<void> {
        try {
            // Write our public key to the handshake characteristic
            await device.writeCharacteristicWithResponseForService(
                BITCHAT_SERVICE_UUID,
                HANDSHAKE_CHARACTERISTIC_UUID,
                Buffer.from(publicKey, 'base64').toString('base64')
            );

            console.log('Handshake completed with peer');
        } catch (error) {
            console.error('Handshake failed:', error);
            throw error;
        }
    }

    private async setupMessageMonitoring(device: Device): Promise<void> {
        try {
            // Monitor incoming messages
            device.monitorCharacteristicForService(
                BITCHAT_SERVICE_UUID,
                MESSAGE_CHARACTERISTIC_UUID,
                (error: BleError | null, characteristic: Characteristic | null) => {
                    if (error) {
                        console.error('Message monitoring error:', error);
                        return;
                    }

                    if (characteristic?.value) {
                        try {
                            const messageData = Buffer.from(characteristic.value, 'base64').toString('utf8');
                            const message = JSON.parse(messageData);
                            this.emit('messageReceived', { message, peerId: device.id });
                            console.log('Received message from peer:', device.id);
                        } catch (parseError) {
                            console.error('Failed to parse received message:', parseError);
                        }
                    }
                }
            );
        } catch (error) {
            console.error('Failed to setup message monitoring:', error);
            throw error;
        }
    }

    async disconnectPeer(deviceId: string): Promise<void> {
        const peer = this.connectedPeers.get(deviceId);
        if (!peer?.peripheral) {
            console.log(`Peer ${deviceId} not connected`);
            return;
        }

        console.log(`Disconnecting from peer: ${deviceId}`);

        try {
            await this.bleManager.cancelDeviceConnection(deviceId);
            this.connectedPeers.delete(deviceId);
            this.emit('peerDisconnected', deviceId);
        } catch (error) {
            console.error(`Failed to disconnect from peer ${deviceId}:`, error);
            throw error;
        }
    }

    async sendMessage(message: BitchatMessage, targetPeerId?: string): Promise<void> {
        console.log('Sending message via BLE mesh:', message);

        const messageData = JSON.stringify(message);
        const base64Data = Buffer.from(messageData, 'utf8').toString('base64');

        if (targetPeerId) {
            // Direct message to specific peer
            const peer = this.connectedPeers.get(targetPeerId);
            if (peer?.peripheral) {
                await this.sendToPeer(peer.peripheral, base64Data);
                this.emit('messageSent', { message, peer });
            } else {
                throw new Error(`Peer ${targetPeerId} not connected`);
            }
        } else {
            // Broadcast to all connected peers
            const sendPromises = Array.from(this.connectedPeers.values()).map(async (peer) => {
                if (peer.peripheral) {
                    try {
                        await this.sendToPeer(peer.peripheral, base64Data);
                        this.emit('messageSent', { message, peer });
                    } catch (error) {
                        console.error(`Failed to send to peer ${peer.id}:`, error);
                    }
                }
            });

            await Promise.allSettled(sendPromises);
        }
    }

    private async sendToPeer(device: Device, data: string): Promise<void> {
        try {
            await device.writeCharacteristicWithResponseForService(
                BITCHAT_SERVICE_UUID,
                MESSAGE_CHARACTERISTIC_UUID,
                data
            );
        } catch (error) {
            console.error('Failed to send message to peer:', error);
            throw error;
        }
    }

    getConnectedPeers(): Peer[] {
        return Array.from(this.connectedPeers.values());
    }

    getDiscoveredDevices(): BluetoothDevice[] {
        return Array.from(this.discoveredDevices.values());
    }

    isCurrentlyScanning(): boolean {
        return this.isScanning;
    }

    async cleanup(): Promise<void> {
        console.log('Cleaning up BluetoothMeshService...');

        await this.stopScanning();

        // Disconnect all peers
        const disconnectPromises = Array.from(this.connectedPeers.keys()).map(
            peerId => this.disconnectPeer(peerId)
        );
        await Promise.allSettled(disconnectPromises);

        this.connectedPeers.clear();
        this.discoveredDevices.clear();
        this.isInitialized = false;
    }
}

export default new BluetoothMeshService();
