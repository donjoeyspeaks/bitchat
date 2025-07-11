import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Surface,
  Text,
  Card,
  Avatar,
  Chip,
  IconButton,
  useTheme,
  FAB,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { BitchatPeer } from '../types';

export function PeerListScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();

  const { connectedPeers, discoveredPeers, isScanning } = useSelector(
    (state: RootState) => state.peers
  );

  const allPeers = [
    ...Object.values(connectedPeers),
    ...Object.values(discoveredPeers).filter(p => !connectedPeers[p.id]),
  ];

  const renderPeer = ({ item }: { item: BitchatPeer }) => (
    <Card style={styles.peerCard} mode="outlined">
      <Card.Content>
        <View style={styles.peerHeader}>
          <View style={styles.peerInfo}>
            <Avatar.Text
              size={40}
              label={item.nickname?.[0]?.toUpperCase() || 'U'}
              style={{
                backgroundColor: item.isConnected
                  ? theme.colors.primary
                  : theme.colors.outline
              }}
            />
            <View style={styles.peerText}>
              <Text variant="titleMedium">
                {item.nickname || `Peer ${item.id.slice(0, 8)}`}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {item.deviceInfo?.platform} • Last seen: {new Date(item.lastSeen).toLocaleTimeString()}
              </Text>
            </View>
          </View>

          <View style={styles.peerActions}>
            <Chip
              icon={item.isConnected ? 'wifi' : 'wifi-off'}
              style={{
                backgroundColor: item.isConnected
                  ? theme.colors.primary + '20'
                  : theme.colors.outline + '20'
              }}
              textStyle={{
                color: item.isConnected
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant
              }}
            >
              {item.connectionType.toUpperCase()}
            </Chip>

            {item.rssi && (
              <Chip
                icon="signal"
                style={{ marginLeft: 8 }}
              >
                {item.rssi} dBm
              </Chip>
            )}
          </View>
        </View>

        <View style={styles.peerDetails}>
          {item.bsvAddress && (
            <Text variant="bodySmall" style={styles.bsvAddress}>
              BSV: {item.bsvAddress.slice(0, 12)}...
            </Text>
          )}

          <View style={styles.peerTags}>
            {item.isFavorite && (
              <Chip icon="heart" compact>Favorite</Chip>
            )}
            {item.isBlocked && (
              <Chip icon="block-helper" compact style={{ marginLeft: 4 }}>
                Blocked
              </Chip>
            )}
          </View>
        </View>
      </Card.Content>

      <Card.Actions>
        <IconButton
          icon="message"
          onPress={() => {
            // TODO: Start private chat
          }}
        />
        <IconButton
          icon={item.isFavorite ? "heart" : "heart-outline"}
          onPress={() => {
            // TODO: Toggle favorite
          }}
        />
        <IconButton
          icon="dots-vertical"
          onPress={() => {
            // TODO: Show peer options
          }}
        />
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <View style={styles.headerContent}>
          <Text variant="titleLarge">Mesh Network</Text>
          <View style={styles.networkStats}>
            <Chip
              icon="account-group"
              style={{ marginRight: 8 }}
            >
              {Object.keys(connectedPeers).length} connected
            </Chip>
            <Chip
              icon="radar"
              style={{
                backgroundColor: isScanning
                  ? theme.colors.primary + '20'
                  : theme.colors.outline + '20'
              }}
            >
              {isScanning ? 'Scanning...' : 'Idle'}
            </Chip>
          </View>
        </View>
      </Surface>

      <FlatList
        data={allPeers}
        keyExtractor={(item) => item.id}
        renderItem={renderPeer}
        style={styles.peerList}
        contentContainerStyle={styles.peerListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={{ textAlign: 'center', marginBottom: 16 }}>
              No peers discovered yet
            </Text>
            <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
              Make sure Bluetooth is enabled and start scanning for nearby BitChat users
            </Text>
          </View>
        }
      />

      <FAB
        icon={isScanning ? "stop" : "radar"}
        label={isScanning ? "Stop Scan" : "Start Scan"}
        style={styles.fab}
        onPress={() => {
          // TODO: Toggle scanning
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  networkStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  peerList: {
    flex: 1,
  },
  peerListContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  peerCard: {
    marginBottom: 12,
  },
  peerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  peerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  peerText: {
    marginLeft: 12,
    flex: 1,
  },
  peerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  peerDetails: {
    marginLeft: 52,
  },
  bsvAddress: {
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  peerTags: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
