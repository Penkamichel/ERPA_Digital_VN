import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { SyncQueueItem } from '../types';

const SYNC_QUEUE_KEY = '@sync_queue';

export async function addToSyncQueue(
  userId: string,
  tableName: string,
  operation: 'insert' | 'update' | 'delete',
  data: any
): Promise<void> {
  const queueItem: SyncQueueItem = {
    id: Date.now().toString(),
    userId,
    tableName,
    operation,
    data,
    synced: false,
    createdAt: new Date().toISOString(),
  };

  try {
    const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    const queue: SyncQueueItem[] = queueJson ? JSON.parse(queueJson) : [];
    queue.push(queueItem);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error adding to sync queue:', error);
  }
}

export async function syncQueue(): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  try {
    const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (!queueJson) return { success, failed };

    const queue: SyncQueueItem[] = JSON.parse(queueJson);
    const unsyncedItems = queue.filter(item => !item.synced);

    for (const item of unsyncedItems) {
      try {
        switch (item.operation) {
          case 'insert':
            await supabase.from(item.tableName).insert(item.data);
            break;
          case 'update':
            await supabase.from(item.tableName).update(item.data).eq('id', item.data.id);
            break;
          case 'delete':
            await supabase.from(item.tableName).delete().eq('id', item.data.id);
            break;
        }
        item.synced = true;
        success++;
      } catch (error) {
        console.error(`Error syncing item ${item.id}:`, error);
        failed++;
      }
    }

    const updatedQueue = queue.map(item =>
      unsyncedItems.find(ui => ui.id === item.id)?.synced ? { ...item, synced: true } : item
    );
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updatedQueue));

    const remainingUnsynced = updatedQueue.filter(item => !item.synced);
    if (remainingUnsynced.length === 0) {
      await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    }
  } catch (error) {
    console.error('Error syncing queue:', error);
  }

  return { success, failed };
}

export async function getPendingSyncCount(): Promise<number> {
  try {
    const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (!queueJson) return 0;
    const queue: SyncQueueItem[] = JSON.parse(queueJson);
    return queue.filter(item => !item.synced).length;
  } catch (error) {
    console.error('Error getting pending sync count:', error);
    return 0;
  }
}
