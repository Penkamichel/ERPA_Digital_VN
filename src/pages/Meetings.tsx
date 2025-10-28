import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';
import { Card, CardBody } from '../components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { Calendar, Users, CheckCircle, XCircle, Eye } from 'lucide-react';

interface MeetingActivity {
  id: string;
  activity_id: string;
  vote_result: 'approved' | 'rejected';
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  activity: {
    activity_name: string;
    total_budget: number;
  };
}

export default function Meetings() {
  const navigate = useNavigate();
  const { selectedCommuneId, selectedFiscalYearId } = useApp();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [meetingActivities, setMeetingActivities] = useState<MeetingActivity[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (selectedFiscalYearId) {
      loadMeetings();
    }
  }, [selectedCommuneId, selectedFiscalYearId]);

  const loadMeetings = async () => {
    if (!selectedFiscalYearId) return;

    let query = supabase
      .from('meeting_records')
      .select('*, community:communities!inner(*, commune:communes(*))')
      .eq('fiscal_year_id', selectedFiscalYearId);

    if (selectedCommuneId) {
      query = query.eq('community.commune_id', selectedCommuneId);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      console.error('Error loading meetings:', error);
    }

    if (data) setMeetings(data);
  };

  const loadMeetingActivities = async (meetingId: string) => {
    const { data, error } = await supabase
      .from('meeting_activities')
      .select(`
        *,
        activity:plan_activities(activity_name, total_budget)
      `)
      .eq('meeting_id', meetingId);

    if (error) {
      console.error('Error loading meeting activities:', error);
    }

    if (data) {
      setMeetingActivities(data as MeetingActivity[]);
    } else {
      setMeetingActivities([]);
    }
  };

  const handleViewMeeting = async (meeting: any) => {
    setSelectedMeeting(meeting);
    await loadMeetingActivities(meeting.id);
    setShowModal(true);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M VND`;
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
        <p className="text-gray-600 mt-1">View community meeting records and voting results</p>
      </div>

      <div className="grid gap-4">
        {meetings.map((meeting) => (
          <Card key={meeting.id}>
            <CardBody>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {meeting.community?.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {meeting.community?.commune?.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(meeting.date)} at {formatTime(meeting.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{meeting.participants_count} participants</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">{meeting.agenda}</p>
                </div>

                <button
                  onClick={() => handleViewMeeting(meeting)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </CardBody>
          </Card>
        ))}

        {meetings.length === 0 && (
          <Card>
            <CardBody>
              <p className="text-center text-gray-500 py-8">No meetings found for this fiscal year</p>
            </CardBody>
          </Card>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Meeting Minutes Details"
        size="lg"
      >
        {selectedMeeting && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p className="text-gray-900 mt-1">{formatDate(selectedMeeting.date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Time</label>
                <p className="text-gray-900 mt-1">{formatTime(selectedMeeting.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Community</label>
                <p className="text-gray-900 mt-1">{selectedMeeting.community?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Commune</label>
                <p className="text-gray-900 mt-1">{selectedMeeting.community?.commune?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Chairperson</label>
                <p className="text-gray-900 mt-1">{selectedMeeting.chairperson}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Participants</label>
                <p className="text-gray-900 mt-1">{selectedMeeting.participants_count} attendees</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Agenda</label>
              <p className="text-gray-900 mt-1">{selectedMeeting.agenda}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Voting Method</label>
              <p className="text-gray-900 mt-1 capitalize">{selectedMeeting.voting_method}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 mb-3 block">Activities Voted On</label>
              <div className="space-y-3">
                {meetingActivities.length > 0 ? (
                  meetingActivities.map((ma) => (
                    <div
                      key={ma.id}
                      className={`p-4 rounded-lg border-2 ${
                        ma.vote_result === 'approved'
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{ma.activity.activity_name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Budget: {formatCurrency(ma.activity.total_budget)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {ma.vote_result === 'approved' ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span
                            className={`text-sm font-semibold ${
                              ma.vote_result === 'approved' ? 'text-emerald-600' : 'text-red-600'
                            }`}
                          >
                            {ma.vote_result.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-emerald-700 font-medium">
                          For: {ma.votes_for}
                        </span>
                        <span className="text-red-700 font-medium">
                          Against: {ma.votes_against}
                        </span>
                        <span className="text-gray-600 font-medium">
                          Abstain: {ma.votes_abstain}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No activity votes recorded</p>
                )}
              </div>
            </div>

            {selectedMeeting.minutes_summary && (
              <div>
                <label className="text-sm font-medium text-gray-500">Minutes Summary</label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">{selectedMeeting.minutes_summary}</p>
              </div>
            )}

            {selectedMeeting.minutes_file_url && (
              <div>
                <label className="text-sm font-medium text-gray-500">Minutes File</label>
                <a
                  href={selectedMeeting.minutes_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline block mt-1"
                >
                  Download Meeting Minutes
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
