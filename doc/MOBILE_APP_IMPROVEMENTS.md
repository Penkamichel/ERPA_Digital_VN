# Mobile App Improvements - Implementation Guide

## 🎯 改善要件

### 1. 正しいCMBワークフロー

```
1. Fund登録 (Fund Registration)
   ↓
2. 会議設定 (Meeting Scheduling)
   ↓
3. 議事録登録 (Minutes Upload)
   ↓
4. 計画作成 (Plan Creation)
   ↓
5. 活動実施 (Activity Implementation) - 活動記録の保存
   ↓
6. 最終報告 (Final Report)
```

### 2. クリック可能なワークフロー

各ステップをクリックすると該当ページに遷移：

| ワークフローステップ | 遷移先 |
|---|---|
| Fund登録 | Fund登録ページ |
| 会議設定 | Plan > 会議タブ |
| 議事録登録 | Plan > 会議タブ |
| 計画作成 | Plan > 計画入力タブ |
| 活動実施 | Activity > 活動一覧タブ |
| 最終報告 | Activity > 報告・記録タブ |

### 3. データベース接続

Supabaseから実データを取得：
- FY2023: 完了済み
- FY2024: 完了済み
- FY2025: 進行中

---

## 📊 新しいデータベーステーブル

### `fund_registrations`

```sql
CREATE TABLE fund_registrations (
  id uuid PRIMARY KEY,
  community_id uuid REFERENCES communities(id),
  fiscal_year_id uuid REFERENCES fiscal_years(id),
  approved_amount numeric NOT NULL,
  approval_date date,
  approval_document_url text,
  registered_by text NOT NULL,
  status fund_registration_status, -- draft, registered, verified
  notes text,
  created_at timestamptz,
  UNIQUE(community_id, fiscal_year_id)
);
```

### `workflow_status`

```sql
CREATE TABLE workflow_status (
  id uuid PRIMARY KEY,
  community_id uuid REFERENCES communities(id),
  fiscal_year_id uuid REFERENCES fiscal_years(id),
  fund_registration_completed boolean DEFAULT false,
  meeting_scheduled_completed boolean DEFAULT false,
  minutes_uploaded_completed boolean DEFAULT false,
  plan_created_completed boolean DEFAULT false,
  activities_ongoing boolean DEFAULT false,
  final_report_submitted boolean DEFAULT false,
  current_step text,
  updated_at timestamptz,
  UNIQUE(community_id, fiscal_year_id)
);
```

### デモデータ

**Ban Pho Village:**

| FY | Approved Amount | Workflow Status |
|---|---|---|
| 2023 | 33M VND | 全て完了 |
| 2024 | 37M VND | 全て完了 |
| 2025 | 50M VND | 活動実施中 |

---

## 🔧 実装手順

### Step 1: HomeTab Component

```typescript
interface WorkflowStep {
  id: number;
  name: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  action: string | null;
  navigateTo: {
    tab: Tab;
    view?: string;
  };
}

const workflowSteps: WorkflowStep[] = [
  {
    id: 1,
    name: 'Fund登録',
    description: '承認された予算を登録',
    status: fiscalYearData.workflowStatus.fundRegistrationCompleted ? 'completed' : 'current',
    action: 'Fund登録ページへ',
    navigateTo: { tab: 'plan', view: 'fund-registration' }
  },
  {
    id: 2,
    name: '会議を設定',
    description: '今年の活動を決める話し合い',
    status: fiscalYearData.workflowStatus.meetingScheduledCompleted ? 'completed' :
            fiscalYearData.workflowStatus.fundRegistrationCompleted ? 'current' : 'pending',
    action: '会議設定ページへ',
    navigateTo: { tab: 'plan', view: 'meetings' }
  },
  {
    id: 3,
    name: '議事録を登録',
    description: '会議の記録を保存',
    status: fiscalYearData.workflowStatus.minutesUploadedCompleted ? 'completed' :
            fiscalYearData.workflowStatus.meetingScheduledCompleted ? 'current' : 'pending',
    action: '議事録登録ページへ',
    navigateTo: { tab: 'plan', view: 'meetings' }
  },
  {
    id: 4,
    name: '活動計画を作成',
    description: '何をするか詳しく決める',
    status: fiscalYearData.workflowStatus.planCreatedCompleted ? 'completed' :
            fiscalYearData.workflowStatus.minutesUploadedCompleted ? 'current' : 'pending',
    action: '計画作成ページへ',
    navigateTo: { tab: 'plan', view: 'plan-input' }
  },
  {
    id: 5,
    name: '活動を実施',
    description: '決めたことを実行して記録',
    status: fiscalYearData.workflowStatus.activitiesOngoing ? 'current' :
            fiscalYearData.workflowStatus.planCreatedCompleted ? 'current' : 'pending',
    action: '活動記録ページへ',
    navigateTo: { tab: 'activity', view: 'activities' }
  },
  {
    id: 6,
    name: '最終報告を作成',
    description: '1年間の活動をまとめる',
    status: fiscalYearData.workflowStatus.finalReportSubmitted ? 'completed' :
            fiscalYearData.workflowStatus.activitiesOngoing ? 'current' : 'pending',
    action: '報告書作成ページへ',
    navigateTo: { tab: 'activity', view: 'reporting' }
  },
];
```

### Step 2: クリック可能なワークフローUI

```tsx
<div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
  <h2 className="font-bold mb-3">🗓️ 今年の作業の流れ</h2>
  {workflowSteps.map((step, idx) => (
    <button
      key={step.id}
      onClick={() => {
        setActiveTab(step.navigateTo.tab);
        if (step.navigateTo.view) {
          setCurrentView(step.navigateTo.view);
        }
      }}
      disabled={step.status === 'pending'}
      className={`w-full flex gap-3 mb-3 last:mb-0 text-left ${
        step.status === 'pending' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 rounded-lg p-2 -m-2'
      }`}
    >
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step.status === 'completed' ? 'bg-emerald-500 text-white' :
            step.status === 'current' ? 'bg-blue-500 text-white' :
            'bg-gray-200 text-gray-400'
          }`}
        >
          {step.status === 'completed' ? <Check className="w-5 h-5" /> :
           step.status === 'current' ? <AlertCircle className="w-5 h-5" /> :
           <Circle className="w-5 h-5" />}
        </div>
        {idx < workflowSteps.length - 1 && (
          <div className={`w-0.5 h-8 ${step.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
        )}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${step.status === 'current' ? 'text-blue-600' : ''}`}>
          {step.name}
        </p>
        <p className="text-xs text-gray-600">{step.description}</p>
        {step.status !== 'pending' && step.action && (
          <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
            <span>{step.action}</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        )}
      </div>
    </button>
  ))}
</div>
```

### Step 3: データ取得ロジック

```typescript
const loadFiscalYearData = async () => {
  const { data: community } = await supabase
    .from('communities')
    .select('id')
    .eq('name', 'Ban Pho Village')
    .maybeSingle();

  const { data: fy } = await supabase
    .from('fiscal_years')
    .select('id')
    .eq('year', selectedYear)
    .maybeSingle();

  const { data: fundReg } = await supabase
    .from('fund_registrations')
    .select('approved_amount')
    .eq('community_id', community.id)
    .eq('fiscal_year_id', fy.id)
    .maybeSingle();

  const { data: workflow } = await supabase
    .from('workflow_status')
    .select('*')
    .eq('community_id', community.id)
    .eq('fiscal_year_id', fy.id)
    .maybeSingle();

  setFiscalYearData({
    year: selectedYear,
    totalBudget: fundReg?.approved_amount || 0,
    workflowStatus: {
      fundRegistrationCompleted: workflow?.fund_registration_completed || false,
      meetingScheduledCompleted: workflow?.meeting_scheduled_completed || false,
      minutesUploadedCompleted: workflow?.minutes_uploaded_completed || false,
      planCreatedCompleted: workflow?.plan_created_completed || false,
      activitiesOngoing: workflow?.activities_ongoing || false,
      finalReportSubmitted: workflow?.final_report_submitted || false,
    },
  });
};
```

### Step 4: 年度切り替え

```tsx
<select
  value={selectedYear}
  onChange={(e) => setSelectedYear(Number(e.target.value))}
  className="px-3 py-2 border rounded-lg text-sm"
>
  <option value={2025}>2025年（今年）</option>
  <option value={2024}>2024年</option>
  <option value={2023}>2023年</option>
</select>
```

FY2023/2024を選択すると：
- 全ワークフローステップが✅ Completed
- "最終報告を作成" ステップに「報告書を見る」リンク

---

## 📱 UI改善まとめ

### Home画面
✅ 正しいワークフローに修正（6ステップ）
✅ 各ステップがクリック可能
✅ 年度選択でFY2023/2024の履歴表示
✅ Supabaseから実データ取得

### Plan画面
✅ Fund登録サブタブ追加（新規）
✅ アイデアタブ（年度フィルター付き）
✅ 会議タブ（会議設定+議事録登録）
✅ 計画入力タブ（CMBのみ）

### Activity画面
✅ 年度フィルター
✅ 予算サマリー（実データ）
✅ 活動一覧タブ
✅ 報告・記録タブ

---

## 🚀 次のステップ

1. **MobileAppDemo.tsxを完全に書き直す**（600行以上）
2. **supabase接続を各コンポーネントに追加**
3. **ナビゲーション状態管理を実装**
4. **年度切り替えロジックを実装**
5. **ビルドとテスト**

ファイルサイズの制限により、段階的な実装が必要です。
