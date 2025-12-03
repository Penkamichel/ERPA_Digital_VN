import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../utils/supabase';
import { addToSyncQueue } from '../../utils/offlineSync';
import { Idea, Meeting } from '../../types';
import { format } from 'date-fns';
import FiscalYearSelector from '../../components/FiscalYearSelector';

export default function ParticipateScreen() {
  const { user, hasPermission } = useAuth();
  const { selectedFiscalYear, isOffline } = useApp();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: '', description: '', category: 'general' });
  const [activeTab, setActiveTab] = useState<'ideas' | 'meetings'>('ideas');

  useEffect(() => {
    if (selectedFiscalYear) {
      loadData();
    }
  }, [selectedFiscalYear, user]);

  const loadData = async () => {
    await Promise.all([loadIdeas(), loadMeetings()]);
  };

  const loadIdeas = async () => {
    if (!selectedFiscalYear || !user) return;

    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('fiscal_year_id', selectedFiscalYear.id)
      .eq('community_id', user.communityId)
      .order('created_at', { ascending: false });

    if (data) {
      setIdeas(data.map(mapIdea));
    }
  };

  const loadMeetings = async () => {
    if (!selectedFiscalYear || !user) return;

    const { data } = await supabase
      .from('meeting_records')
      .select('*')
      .eq('fiscal_year_id', selectedFiscalYear.id)
      .eq('community_id', user.communityId)
      .order('date', { ascending: false });

    if (data) {
      setMeetings(data.map(mapMeeting));
    }
  };

  const mapIdea = (data: any): Idea => ({
    id: data.id,
    communityId: data.community_id,
    fiscalYearId: data.fiscal_year_id,
    submittedBy: data.submitted_by,
    title: data.title,
    description: data.description,
    category: data.category,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  });

  const mapMeeting = (data: any): Meeting => ({
    id: data.id,
    communityId: data.community_id,
    fiscalYearId: data.fiscal_year_id,
    date: data.date,
    chairperson: data.chairperson,
    participantsCount: data.participants_count,
    agenda: data.agenda,
    votingMethod: data.voting_method,
    minutesFileUrl: data.minutes_file_url,
    minutesSummary: data.minutes_summary,
  });

  const handleSubmitIdea = async () => {
    if (!newIdea.title.trim() || !newIdea.description.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!user || !selectedFiscalYear) return;

    const ideaData = {
      community_id: user.communityId,
      fiscal_year_id: selectedFiscalYear.id,
      submitted_by: user.name,
      title: newIdea.title,
      description: newIdea.description,
      category: newIdea.category,
      status: 'submitted',
    };

    if (isOffline) {
      await addToSyncQueue(user.id, 'ideas', 'insert', ideaData);
      Alert.alert('Success', 'Idea saved offline. Will sync when online.');
    } else {
      const { error } = await supabase.from('ideas').insert(ideaData);
      if (error) {
        Alert.alert('Error', 'Failed to submit idea');
        return;
      }
      Alert.alert('Success', 'Idea submitted successfully');
      loadIdeas();
    }

    setNewIdea({ title: '', description: '', category: 'general' });
    setShowIdeaForm(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: '#f59e0b',
      under_review: '#3b82f6',
      approved: '#10b981',
      rejected: '#ef4444',
      implemented: '#8b5cf6',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      submitted: 'Submitted',
      under_review: 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected',
      implemented: 'Implemented',
    };
    return labels[status] || status;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Participate</Text>
      </View>

      <FiscalYearSelector />

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ideas' && styles.tabActive]}
          onPress={() => setActiveTab('ideas')}
        >
          <Text style={[styles.tabText, activeTab === 'ideas' && styles.tabTextActive]}>
            Ideas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'meetings' && styles.tabActive]}
          onPress={() => setActiveTab('meetings')}
        >
          <Text style={[styles.tabText, activeTab === 'meetings' && styles.tabTextActive]}>
            Meetings
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'ideas' && (
          <>
            {hasPermission('submit_idea') && (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => setShowIdeaForm(true)}
              >
                <Text style={styles.submitButtonText}>💡 Submit New Idea</Text>
              </TouchableOpacity>
            )}

            {ideas.map(idea => (
              <View key={idea.id} style={styles.ideaCard}>
                <View style={styles.ideaHeader}>
                  <Text style={styles.ideaTitle}>{idea.title}</Text>
                  <View
                    style={[styles.statusBadge, { backgroundColor: getStatusColor(idea.status) }]}
                  >
                    <Text style={styles.statusText}>{getStatusLabel(idea.status)}</Text>
                  </View>
                </View>
                <Text style={styles.ideaDescription} numberOfLines={3}>
                  {idea.description}
                </Text>
                <View style={styles.ideaFooter}>
                  <Text style={styles.ideaMeta}>By {idea.submittedBy}</Text>
                  <Text style={styles.ideaMeta}>
                    {format(new Date(idea.createdAt), 'MMM dd, yyyy')}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {activeTab === 'meetings' && (
          <>
            {meetings.map(meeting => (
              <View key={meeting.id} style={styles.meetingCard}>
                <View style={styles.meetingHeader}>
                  <Text style={styles.meetingDate}>
                    {format(new Date(meeting.date), 'MMMM dd, yyyy')}
                  </Text>
                  <Text style={styles.meetingChair}>Chair: {meeting.chairperson}</Text>
                </View>
                <Text style={styles.meetingAgenda}>{meeting.agenda}</Text>
                <Text style={styles.meetingParticipants}>
                  👥 {meeting.participantsCount} participants
                </Text>
                {meeting.minutesSummary && (
                  <View style={styles.minutesPreview}>
                    <Text style={styles.minutesLabel}>Minutes Summary:</Text>
                    <Text style={styles.minutesText} numberOfLines={3}>
                      {meeting.minutesSummary}
                    </Text>
                  </View>
                )}
                {meeting.minutesFileUrl && (
                  <TouchableOpacity style={styles.viewMinutesButton}>
                    <Text style={styles.viewMinutesText}>View Full Minutes</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <Modal visible={showIdeaForm} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Submit New Idea</Text>

            <TextInput
              style={styles.input}
              placeholder="Idea Title"
              value={newIdea.title}
              onChangeText={text => setNewIdea({ ...newIdea, title: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={newIdea.description}
              onChangeText={text => setNewIdea({ ...newIdea, description: text })}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowIdeaForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitModalButton]}
                onPress={handleSubmitIdea}
              >
                <Text style={styles.submitModalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#2563eb',
  },
  content: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  ideaCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ideaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ideaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  ideaDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  ideaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ideaMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  meetingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  meetingHeader: {
    marginBottom: 8,
  },
  meetingDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  meetingChair: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  meetingAgenda: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  meetingParticipants: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  minutesPreview: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  minutesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  minutesText: {
    fontSize: 14,
    color: '#374151',
  },
  viewMinutesButton: {
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewMinutesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitModalButton: {
    backgroundColor: '#2563eb',
  },
  submitModalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
