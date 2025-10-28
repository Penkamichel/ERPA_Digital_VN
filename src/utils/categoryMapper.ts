export type ExpenditureFamily =
  | 'forest_protection_contracts'
  | 'forest_management_participation'
  | 'livelihood_development'
  | 'fund_admin_other';

export type ProgramCategory =
  | 'agroforestry_extension'
  | 'seedlings_tools_processing'
  | 'construction_materials_small_works'
  | 'community_awareness'
  | 'training_and_rules';

export type CostType =
  | 'personnel_labor'
  | 'materials_supplies'
  | 'equipment'
  | 'services_contractors'
  | 'transport_logistics'
  | 'communication'
  | 'meeting_event_costs'
  | 'admin_overhead'
  | 'fees_permits'
  | 'contingency';

export const EXPENDITURE_FAMILY_LABELS: Record<ExpenditureFamily, string> = {
  forest_protection_contracts: 'Forest Protection Contracts',
  forest_management_participation: 'Forest Management Participation',
  livelihood_development: 'Livelihood Development',
  fund_admin_other: 'Fund Admin & Other',
};

export const EXPENDITURE_FAMILY_COLORS: Record<ExpenditureFamily, string> = {
  forest_protection_contracts: '#0891b2',
  forest_management_participation: '#8b5cf6',
  livelihood_development: '#dc2626',
  fund_admin_other: '#f59e0b',
};

export const PROGRAM_CATEGORY_LABELS: Record<ProgramCategory, string> = {
  agroforestry_extension: 'Agroforestry Extension',
  seedlings_tools_processing: 'Seedlings, Tools & Processing',
  construction_materials_small_works: 'Construction & Small Works',
  community_awareness: 'Community Awareness',
  training_and_rules: 'Training & Rules',
};

export const PROGRAM_CATEGORY_COLORS: Record<ProgramCategory, string> = {
  agroforestry_extension: '#ef4444',
  seedlings_tools_processing: '#f87171',
  construction_materials_small_works: '#fb923c',
  community_awareness: '#fbbf24',
  training_and_rules: '#fb7185',
};

export const COST_TYPE_LABELS: Record<CostType, string> = {
  personnel_labor: 'Personnel & Labor',
  materials_supplies: 'Materials & Supplies',
  equipment: 'Equipment',
  services_contractors: 'Services & Contractors',
  transport_logistics: 'Transport & Logistics',
  communication: 'Communication',
  meeting_event_costs: 'Meeting & Event Costs',
  admin_overhead: 'Admin Overhead',
  fees_permits: 'Fees & Permits',
  contingency: 'Contingency',
};

const familyKeywords: Record<ExpenditureFamily, string[]> = {
  forest_protection_contracts: [
    'patrol',
    'protection',
    'guard',
    'ranger',
    'surveillance',
    'boundary',
    'monitoring contract',
  ],
  forest_management_participation: [
    'meeting',
    'facilitation',
    'community rule',
    'village rule',
    'participation',
    'consultation',
    'engagement',
  ],
  livelihood_development: [
    'seedling',
    'plantation',
    'agroforestry',
    'training',
    'extension',
    'construction',
    'awareness',
    'livelihood',
    'income',
    'demonstration',
    'processing',
  ],
  fund_admin_other: [
    'management',
    'administration',
    'ERPA',
    'operational',
    'office',
    'overhead',
  ],
};

const programKeywords: Record<ProgramCategory, string[]> = {
  agroforestry_extension: [
    'extension',
    'demonstration',
    'field day',
    'farmer training',
    'agroforestry demo',
  ],
  seedlings_tools_processing: [
    'seedling',
    'sapling',
    'nursery',
    'breed',
    'tool',
    'processing equipment',
    'machinery',
  ],
  construction_materials_small_works: [
    'construction',
    'cement',
    'culvert',
    'drainage',
    'repair',
    'small work',
    'infrastructure',
    'material',
  ],
  community_awareness: [
    'poster',
    'banner',
    'awareness',
    'campaign',
    'communication',
    'outreach',
    'leaflet',
  ],
  training_and_rules: [
    'training',
    'workshop',
    'rule',
    'regulation',
    'guideline',
    'capacity building',
  ],
};

const costKeywords: Record<CostType, string[]> = {
  personnel_labor: ['wage', 'salary', 'labor', 'worker', 'staff'],
  materials_supplies: ['material', 'supply', 'raw material', 'consumable'],
  equipment: ['equipment', 'tool', 'machine', 'device', 'instrument'],
  services_contractors: ['contractor', 'consultant', 'service', 'outsource'],
  transport_logistics: ['fuel', 'transport', 'vehicle', 'logistics', 'shipping'],
  communication: ['phone', 'internet', 'communication', 'mobile'],
  meeting_event_costs: ['meeting', 'event', 'refreshment', 'venue'],
  admin_overhead: ['stationery', 'office', 'administration', 'overhead'],
  fees_permits: ['fee', 'permit', 'license', 'registration'],
  contingency: ['contingency', 'emergency', 'reserve'],
};

export function autoCategorizeFamily(
  itemName: string,
  activityName?: string
): ExpenditureFamily {
  const searchText = `${itemName} ${activityName || ''}`.toLowerCase().trim();

  for (const [family, keywords] of Object.entries(familyKeywords)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return family as ExpenditureFamily;
      }
    }
  }

  return 'livelihood_development';
}

export function autoCategorizeProgram(
  itemName: string,
  activityName?: string
): ProgramCategory | null {
  const searchText = `${itemName} ${activityName || ''}`.toLowerCase().trim();

  for (const [program, keywords] of Object.entries(programKeywords)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return program as ProgramCategory;
      }
    }
  }

  return 'seedlings_tools_processing';
}

export function autoCategorizeCostType(itemName: string): CostType {
  const normalizedName = itemName.toLowerCase().trim();

  for (const [costType, keywords] of Object.entries(costKeywords)) {
    for (const keyword of keywords) {
      if (normalizedName.includes(keyword.toLowerCase())) {
        return costType as CostType;
      }
    }
  }

  return 'materials_supplies';
}

export function getFamilyLabel(family: ExpenditureFamily): string {
  return EXPENDITURE_FAMILY_LABELS[family] || family;
}

export function getFamilyColor(family: ExpenditureFamily): string {
  return EXPENDITURE_FAMILY_COLORS[family] || '#9ca3af';
}

export function getProgramLabel(program: ProgramCategory): string {
  return PROGRAM_CATEGORY_LABELS[program] || program;
}

export function getProgramColor(program: ProgramCategory): string {
  return PROGRAM_CATEGORY_COLORS[program] || '#9ca3af';
}

export function getCostTypeLabel(costType: CostType): string {
  return COST_TYPE_LABELS[costType] || costType;
}
