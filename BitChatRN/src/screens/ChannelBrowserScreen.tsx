import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Surface,
  Text,
  Card,
  Button,
  TextInput,
  Chip,
  IconButton,
  useTheme,
  Dialog,
  Portal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { BitchatChannel } from '../types';

export function ChannelBrowserScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelPassword, setNewChannelPassword] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const { channels } = useSelector((state: RootState) => state.chat);

  // Mock discovered channels for demo
  const discoveredChannels: BitchatChannel[] = [
    {
      name: '#general',
      creator: 'peer1',
      isPasswordProtected: false,
      hasRetention: true,
      memberCount: 12,
      members: new Set(['peer1', 'peer2', 'peer3']),
    },
    {
      name: '#crypto-talk',
      creator: 'peer2',
      isPasswordProtected: false,
      hasRetention: true,
      memberCount: 8,
      members: new Set(['peer1', 'peer4', 'peer5']),
    },
    {
      name: '#private-group',
      creator: 'peer3',
      isPasswordProtected: true,
      hasRetention: false,
      memberCount: 3,
      members: new Set(['peer3', 'peer6']),
    },
  ];

  const renderChannel = ({ item }: { item: BitchatChannel }) => (
    <Card style={styles.channelCard} mode="outlined">
      <Card.Content>
        <View style={styles.channelHeader}>
          <View style={styles.channelInfo}>
            <Text variant="titleMedium">{item.name}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Created by {item.creator}
            </Text>
          </View>

          <View style={styles.channelMeta}>
            <Chip
              icon="account-group"
              compact
              style={{ marginBottom: 4 }}
            >
              {item.memberCount} members
            </Chip>

            <View style={styles.channelTags}>
              {item.isPasswordProtected && (
                <Chip icon="lock" compact style={{ marginRight: 4 }}>
                  Private
                </Chip>
              )}
              {item.hasRetention && (
                <Chip icon="content-save" compact>
                  Saved
                </Chip>
              )}
            </View>
          </View>
        </View>
      </Card.Content>

      <Card.Actions>
        <Button
          mode="contained"
          onPress={() => {
            if (item.isPasswordProtected) {
              setSelectedChannel(item.name);
              // TODO: Show password dialog
            } else {
              // TODO: Join channel directly
            }
          }}
        >
          Join Channel
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <View style={styles.headerContent}>
          <Text variant="titleLarge">Channels</Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => setShowCreateDialog(true)}
          >
            Create
          </Button>
        </View>
      </Surface>

      <FlatList
        data={discoveredChannels}
        keyExtractor={(item) => item.name}
        renderItem={renderChannel}
        style={styles.channelList}
        contentContainerStyle={styles.channelListContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Discovered Channels
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Public channels visible on the mesh network
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={{ textAlign: 'center', marginBottom: 16 }}>
              No channels found
            </Text>
            <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
              Create a new channel or wait for others to be discovered
            </Text>
          </View>
        }
      />

      {/* Create Channel Dialog */}
      <Portal>
        <Dialog visible={showCreateDialog} onDismiss={() => setShowCreateDialog(false)}>
          <Dialog.Title>Create Channel</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Channel Name"
              value={newChannelName}
              onChangeText={setNewChannelName}
              placeholder="#my-channel"
              style={{ marginBottom: 16 }}
            />
            <TextInput
              label="Password (Optional)"
              value={newChannelPassword}
              onChangeText={setNewChannelPassword}
              placeholder="Leave empty for public channel"
              secureTextEntry
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={() => {
                // TODO: Create channel
                setShowCreateDialog(false);
                setNewChannelName('');
                setNewChannelPassword('');
              }}
              disabled={!newChannelName.trim()}
            >
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  channelList: {
    flex: 1,
  },
  channelListContent: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  channelCard: {
    marginBottom: 12,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  channelInfo: {
    flex: 1,
    marginRight: 16,
  },
  channelMeta: {
    alignItems: 'flex-end',
  },
  channelTags: {
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
});
