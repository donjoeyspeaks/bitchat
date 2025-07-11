/**
 * BLE Test Screen for BitChat React Native
 * Test basic Bluetooth Low Energy functionality
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Button, Card, List, Chip } from 'react-native-paper';
import BluetoothMeshService from '../services/BluetoothMeshService';

interface BluetoothDevice {
    id: string;
    name?: string;
    rssi?: number;
}

interface Peer {
    id: string;
    deviceName?: string;
    rssi?: number;
    lastSeen: Date;
}

export default function BLETestScreen() {
    const [isScanning, setIsScanning] = useState(false);
    const [discoveredDevices, setDiscoveredDevices] = useState<BluetoothDevice[]>([]);
    const [connectedPeers, setConnectedPeers] = useState<Peer[]>([]);
    const [bleStatus, setBleStatus] = useState<string>('Checking...');

    useEffect(() => {
        // Initialize BLE service and set up listeners
        const initializeBLE = async () => {
            try {
                await BluetoothMeshService.initialize();
                setBleStatus('Ready');
            } catch (error) {
                console.error('BLE initialization failed:', error);
                setBleStatus(`Error: ${error}`);
                Alert.alert('BLE Error', `Failed to initialize Bluetooth: ${error}`);
            }
        };

        initializeBLE();

        // Set up event listeners
        const onDeviceDiscovered = (device: BluetoothDevice) => {
            setDiscoveredDevices(prev => {
                const exists = prev.find(d => d.id === device.id);
                if (exists) return prev;
                return [...prev, device];
            });
        };

        const onPeerConnected = (peer: Peer) => {
            setConnectedPeers(prev => [...prev, peer]);
            Alert.alert('Peer Connected', `Connected to ${peer.deviceName || peer.id}`);
        };

        const onPeerDisconnected = (peerId: string) => {
            setConnectedPeers(prev => prev.filter(p => p.id !== peerId));
            Alert.alert('Peer Disconnected', `Disconnected from ${peerId}`);
        };

        const onScanError = (error: any) => {
            console.error('Scan error:', error);
            Alert.alert('Scan Error', `Bluetooth scan failed: ${error}`);
            setIsScanning(false);
        };

        BluetoothMeshService.on('deviceDiscovered', onDeviceDiscovered);
        BluetoothMeshService.on('peerConnected', onPeerConnected);
        BluetoothMeshService.on('peerDisconnected', onPeerDisconnected);
        BluetoothMeshService.on('scanError', onScanError);

        return () => {
            BluetoothMeshService.off('deviceDiscovered', onDeviceDiscovered);
            BluetoothMeshService.off('peerConnected', onPeerConnected);
            BluetoothMeshService.off('peerDisconnected', onPeerDisconnected);
            BluetoothMeshService.off('scanError', onScanError);
        };
    }, []);

    const startScanning = async () => {
        try {
            setDiscoveredDevices([]);
            setIsScanning(true);
            await BluetoothMeshService.startScanning();

            // Auto-stop scanning after 30 seconds
            setTimeout(() => {
                stopScanning();
            }, 30000);
        } catch (error) {
            console.error('Failed to start scanning:', error);
            Alert.alert('Scan Error', `Failed to start scanning: ${error}`);
            setIsScanning(false);
        }
    };

    const stopScanning = async () => {
        try {
            await BluetoothMeshService.stopScanning();
            setIsScanning(false);
        } catch (error) {
            console.error('Failed to stop scanning:', error);
        }
    };

    const connectToDevice = async (device: BluetoothDevice) => {
        try {
            // Generate a mock public key for testing
            const mockPublicKey = 'test-public-key-' + Math.random().toString(36).substring(7);
            await BluetoothMeshService.connectToPeer(device.id, mockPublicKey);
        } catch (error) {
            console.error('Failed to connect to device:', error);
            Alert.alert('Connection Error', `Failed to connect: ${error}`);
        }
    };

    const disconnectFromPeer = async (peerId: string) => {
        try {
            await BluetoothMeshService.disconnectPeer(peerId);
        } catch (error) {
            console.error('Failed to disconnect from peer:', error);
            Alert.alert('Disconnect Error', `Failed to disconnect: ${error}`);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.statusCard}>
                <Card.Content>
                    <Text variant="headlineSmall">BLE Status</Text>
                    <Chip
                        icon={bleStatus === 'Ready' ? 'check-circle' : 'alert-circle'}
                        style={[styles.statusChip, {
                            backgroundColor: bleStatus === 'Ready' ? '#4CAF50' : '#F44336'
                        }]}
                    >
                        {bleStatus}
                    </Chip>
                </Card.Content>
            </Card>

            <Card style={styles.scanCard}>
                <Card.Content>
                    <Text variant="headlineSmall">Device Scanning</Text>
                    <Text variant="bodyMedium" style={styles.subtitle}>
                        Look for other BitChat devices nearby
                    </Text>

                    <View style={styles.buttonRow}>
                        <Button
                            mode="contained"
                            onPress={startScanning}
                            disabled={isScanning || bleStatus !== 'Ready'}
                            style={styles.button}
                        >
                            {isScanning ? 'Scanning...' : 'Start Scan'}
                        </Button>

                        <Button
                            mode="outlined"
                            onPress={stopScanning}
                            disabled={!isScanning}
                            style={styles.button}
                        >
                            Stop Scan
                        </Button>
                    </View>

                    <Text variant="bodySmall" style={styles.info}>
                        Devices found: {discoveredDevices.length}
                    </Text>
                </Card.Content>
            </Card>

            {discoveredDevices.length > 0 && (
                <Card style={styles.devicesCard}>
                    <Card.Content>
                        <Text variant="headlineSmall">Discovered Devices</Text>
                        {discoveredDevices.map((device) => (
                            <List.Item
                                key={device.id}
                                title={device.name || 'Unknown Device'}
                                description={`ID: ${device.id} | RSSI: ${device.rssi || 'N/A'}`}
                                left={(props) => <List.Icon {...props} icon="bluetooth" />}
                                right={(props) => (
                                    <Button
                                        {...props}
                                        mode="outlined"
                                        compact
                                        onPress={() => connectToDevice(device)}
                                    >
                                        Connect
                                    </Button>
                                )}
                                style={styles.deviceItem}
                            />
                        ))}
                    </Card.Content>
                </Card>
            )}

            {connectedPeers.length > 0 && (
                <Card style={styles.peersCard}>
                    <Card.Content>
                        <Text variant="headlineSmall">Connected Peers</Text>
                        {connectedPeers.map((peer) => (
                            <List.Item
                                key={peer.id}
                                title={peer.deviceName || 'Unknown Peer'}
                                description={`Connected | RSSI: ${peer.rssi || 'N/A'}`}
                                left={(props) => <List.Icon {...props} icon="check-circle" color="#4CAF50" />}
                                right={(props) => (
                                    <Button
                                        {...props}
                                        mode="outlined"
                                        compact
                                        onPress={() => disconnectFromPeer(peer.id)}
                                    >
                                        Disconnect
                                    </Button>
                                )}
                                style={styles.peerItem}
                            />
                        ))}
                    </Card.Content>
                </Card>
            )}

            <Card style={styles.infoCard}>
                <Card.Content>
                    <Text variant="headlineSmall">Testing Instructions</Text>
                    <Text variant="bodyMedium">
                        1. Make sure Bluetooth is enabled on your device{'\n'}
                        2. Grant location permissions when prompted{'\n'}
                        3. Run this app on multiple devices{'\n'}
                        4. Start scanning to find other BitChat devices{'\n'}
                        5. Connect to discovered devices to form a mesh network
                    </Text>
                </Card.Content>
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    statusCard: {
        marginBottom: 16,
    },
    statusChip: {
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    scanCard: {
        marginBottom: 16,
    },
    subtitle: {
        marginBottom: 16,
        color: '#666',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    button: {
        flex: 1,
    },
    info: {
        color: '#666',
        fontStyle: 'italic',
    },
    devicesCard: {
        marginBottom: 16,
    },
    deviceItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    peersCard: {
        marginBottom: 16,
    },
    peerItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    infoCard: {
        marginBottom: 16,
    },
});
