# Provincial Fund Mobile App

Multi-role ERPA/BSP mobile application for community-based climate finance management.

## Features

### 🎭 **4 User Roles**

1. **CMB (Community Management Board)** - Full workflow execution
   - Register approved funds
   - Schedule meetings & upload minutes
   - Create Plan & Budget (Part 1 & 2)
   - Upload receipts/photos
   - Write progress notes
   - Submit activity reports
   - Generate Final Financial Report PDF

2. **Community Member** - Participation & monitoring
   - Submit ideas
   - Browse submitted ideas
   - Check upcoming meetings
   - View meeting minutes
   - View approved/rejected ideas
   - View Plan & Budget
   - Monitor activity & financial status

3. **Forest Owner (FO)** - Review & comment
   - View Plan & Budget
   - Add comments (triggers needs-revision)
   - View activities
   - View budget details

4. **CPC (Commune People's Committee)** - Review & comment
   - View Plan & Budget
   - Add comments (triggers needs-revision)
   - View activities & budget
   - View reports

### 📱 **Bottom Tab Navigation**

#### **Home Tab**
- KPI Cards: Total Budget, Total Spent, Total Activities, Active Activities
- Donut Chart: Budget breakdown (FO Support / Community / Other)
- Next Meeting Banner: Date, agenda preview
- Quick Actions: Role-based workflow indicators
- Fiscal Year Selector (global)

#### **Participate Tab**
**Ideas Section:**
- Submit New Idea (Community Members)
- Browse All Ideas with status badges:
  - 🟡 Submitted
  - 🔵 Under Review
  - 🟢 Approved
  - 🔴 Rejected
  - 🟣 Implemented

**Meetings Section:**
- Upcoming meetings list
- Meeting details: date, chairperson, participant count
- Minutes preview (first 3 lines)
- View Full Minutes button

#### **Monitor Tab**
**Activities List:**
- Activity cards with:
  - Progress bar (0-100%)
  - Spending percentage
  - Budget breakdown: FO / Community / Other
  - Evidence icons with count (receipts, photos)

**Detail View** (drill-down):
- Budget Items table
- Receipt uploads with verification status
- Validation: sum(Budget Items) = Part1 amount ✓/✗
- Progress notes timeline
- Related meeting links
- Comments from FO/CPC

#### **Settings Tab**
- Language Selection: English / Thai
- Offline Mode indicator
- Pending sync count
- Sync Now button
- Grievance mechanism links
- App version & info

### 🔒 **Security Features**

**Role-Based Permissions:**
```typescript
CMB: ['register_fund', 'schedule_meeting', 'upload_minutes',
      'create_plan', 'create_budget', 'upload_receipt',
      'upload_photo', 'write_progress_note', 'submit_report',
      'generate_final_report', 'view_all']

Community Member: ['submit_idea', 'view_ideas', 'view_meetings',
                   'view_minutes', 'view_plan', 'view_activities']

Forest Owner: ['view_plan', 'add_comment', 'view_activities', 'view_budget']

CPC: ['view_plan', 'add_comment', 'view_activities',
      'view_budget', 'view_reports']
```

### 📴 **Offline-First Design**

**Local Storage:**
- Drafts saved to AsyncStorage
- Sync queue for pending operations
- Cached fiscal years, activities, meetings

**Sync Functionality:**
```typescript
// Add to sync queue when offline
await addToSyncQueue(userId, 'ideas', 'insert', ideaData);

// Sync when online
const { success, failed } = await syncQueue();
// Shows: "✓ 5 items synced, ✗ 1 failed"
```

## Database Schema

### New Tables

```sql
-- Ideas submitted by community members
CREATE TABLE ideas (
  id uuid PRIMARY KEY,
  community_id uuid REFERENCES communities(id),
  fiscal_year_id uuid REFERENCES fiscal_years(id),
  submitted_by text,
  title text,
  description text,
  category text,
  status idea_status, -- submitted, under_review, approved, rejected, implemented
  created_at timestamptz,
  updated_at timestamptz
);

-- Comments on plans/budgets by FO/CPC
CREATE TABLE comments (
  id uuid PRIMARY KEY,
  plan_activity_id uuid REFERENCES plan_activities(id),
  commented_by text,
  comment_text text,
  comment_type comment_type, -- question, concern, suggestion, approval
  requires_revision boolean,
  created_at timestamptz
);

-- Progress updates by CMB
CREATE TABLE activity_progress_notes (
  id uuid PRIMARY KEY,
  plan_activity_id uuid REFERENCES plan_activities(id),
  note_text text,
  progress_percentage numeric,
  created_by text,
  created_at timestamptz
);

-- Offline sync queue
CREATE TABLE offline_sync_queue (
  id uuid PRIMARY KEY,
  user_id text,
  table_name text,
  operation sync_operation, -- insert, update, delete
  data jsonb,
  synced boolean,
  created_at timestamptz,
  synced_at timestamptz
);
```

## Demo Data

**Community:** Ban Pho Village (FY2025)

**Demo Users:**
1. Siriporn (CMB Coordinator)
2. Somchai (Community Member)
3. Thawatchai (Forest Owner)
4. Anan (CPC Representative)

**Ideas:**
- "Establish Community Seed Bank" - Approved
- "Build Composting Facility" - Under Review
- "Youth Forest Education Program" - Submitted

**Activities:**
- Forest Patrol and Protection (Approved, 50% progress)
- Non-Timber Forest Products Collection (Ongoing, 30% progress)

**Comments:**
- FO: "Budget allocation insufficient, needs revision" ⚠️
- CPC: "Aligns with district goals, approved pending clarification" ✓

**Progress Notes:**
- "Equipment purchased, training scheduled"
- "First training completed with 45 participants"
- "Collection activities started with 12 members"

## Installation

```bash
cd mobile-app
npm install

# Configure environment
cp .env.example .env
# Add your Supabase URL and anon key

# Run on device/simulator
npm run android  # or npm run ios
```

## Environment Variables

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## File Structure

```
mobile-app/
├── src/
│   ├── components/
│   │   └── FiscalYearSelector.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx       # Role-based permissions
│   │   └── AppContext.tsx        # Fiscal year, language
│   ├── navigation/
│   │   └── BottomTabNavigator.tsx
│   ├── screens/
│   │   ├── Home/
│   │   │   └── HomeScreen.tsx    # KPIs, charts, quick actions
│   │   ├── Participate/
│   │   │   └── ParticipateScreen.tsx  # Ideas, meetings
│   │   ├── Monitor/
│   │   │   ├── MonitorScreen.tsx      # Activities list
│   │   │   └── ActivityDetailScreen.tsx
│   │   └── Settings/
│   │       └── SettingsScreen.tsx     # Language, sync, grievance
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── supabase.ts           # Supabase client
│       └── offlineSync.ts        # Sync queue logic
├── App.tsx
└── package.json
```

## Color Scheme (Neutral)

```typescript
const colors = {
  primary: '#2563eb',      // Blue
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Amber
  danger: '#ef4444',       // Red
  neutral: '#6b7280',      // Gray

  // Spending indicators (neutral)
  forestOwner: '#3b82f6',  // Blue
  community: '#10b981',    // Green
  other: '#f59e0b',        // Amber
};
```

## Testing Roles

Login screen allows selecting from 4 demo users. Each role sees different:
- Navigation items
- Action buttons
- Data access levels
- UI components

**Test Scenarios:**
1. CMB: Create plan, upload receipt, write progress note
2. Community Member: Submit idea, view status, check meetings
3. FO: View activity, add comment with "requires_revision"
4. CPC: Review budget, add approval comment

## Offline Mode Testing

1. Enable Airplane mode
2. Submit idea (saves to sync queue)
3. Upload receipt (queued)
4. Write progress note (queued)
5. Disable Airplane mode
6. Tap "Sync Now" in Settings
7. Verify items synced to database

## PDF Report Generation

CMB can generate Final Financial Report PDF containing:
- Executive summary
- Income breakdown
- Expenditure by category
- Activity completion status
- Receipt verification summary
- Signatures section

*Implementation requires react-native-pdf or similar library.*

## Grievance Mechanism

Settings screen includes links to:
- Provincial Fund hotline
- District CPC office
- Online complaint form
- Anonymous feedback portal

## Future Enhancements

- [ ] Push notifications for meeting reminders
- [ ] Photo gallery for activity documentation
- [ ] Multi-language support (Thai, Lao, Khmer)
- [ ] Biometric authentication
- [ ] Export data to Excel
- [ ] Real-time collaboration features
- [ ] Voice memo recording for progress notes

## License

Proprietary - Provincial Fund Management System

## Support

For technical support, contact: support@provincialfund.gov
