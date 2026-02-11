/**
 * Data Flow Journey Constants and Types
 *
 * Defines data journey structures, stage types, and journey templates
 * for the Data Flow Friction Analysis tool.
 *
 * Story 12.1: Data Journey Mapping Interface
 * Covers: FR2-21 (Map data journeys with friction points)
 */

// Maximum number of journeys allowed
export const MAX_JOURNEYS = 10;

// Recommended number of journeys for comprehensive analysis
export const RECOMMENDED_MIN_JOURNEYS = 3;
export const RECOMMENDED_MAX_JOURNEYS = 5;

// Minimum stages per journey
export const MIN_STAGES = 2;

/**
 * Stage types matching Playbook 1 data flow methodology
 */
export type StageType =
  | 'source'
  | 'extraction'
  | 'storage'
  | 'transformation'
  | 'consumption';

/**
 * Latency units for stage timing
 */
export type LatencyUnit = 'hours' | 'days';

/**
 * A single stage in a data journey
 */
export interface DataStage {
  id: string;
  type: StageType;
  systemName: string;
  owner: string;
  latency: number;
  latencyUnit: LatencyUnit;
  order: number;
}

/**
 * A complete data journey from source to consumption
 */
export interface DataJourney {
  id: string;
  name: string;
  description?: string;
  stages: DataStage[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Template for creating a new journey from a pattern
 */
export interface JourneyTemplate {
  id: string;
  name: string;
  description: string;
  stages: Omit<DataStage, 'id'>[];
}

/**
 * Stage type display information
 */
export interface StageTypeInfo {
  id: StageType;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

/**
 * Stage type metadata for display and styling
 */
export const STAGE_TYPES: StageTypeInfo[] = [
  {
    id: 'source',
    label: 'Source Systems',
    shortLabel: 'Source',
    description: 'Where data originates (CRM, ERP, databases)',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-500',
  },
  {
    id: 'extraction',
    label: 'Extraction',
    shortLabel: 'Extract',
    description: 'How data is pulled (ETL, API, batch)',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    borderColor: 'border-purple-500',
  },
  {
    id: 'storage',
    label: 'Storage',
    shortLabel: 'Store',
    description: 'Where data lands (warehouse, lake, mart)',
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-500',
  },
  {
    id: 'transformation',
    label: 'Transformation',
    shortLabel: 'Transform',
    description: 'How data is shaped (dbt, SQL, models)',
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-500',
  },
  {
    id: 'consumption',
    label: 'Consumption',
    shortLabel: 'Consume',
    description: 'Where data is used (dashboards, reports, apps)',
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-500',
  },
];

/**
 * Get stage type info by ID
 */
export function getStageTypeInfo(stageType: StageType): StageTypeInfo {
  return STAGE_TYPES.find((s) => s.id === stageType) || STAGE_TYPES[0];
}

/**
 * Latency unit labels
 */
export const LATENCY_UNIT_LABELS: Record<LatencyUnit, string> = {
  hours: 'hours',
  days: 'days',
};

/**
 * Common system name suggestions for autocomplete
 */
export const SYSTEM_SUGGESTIONS: Record<StageType, string[]> = {
  source: [
    'Salesforce CRM',
    'SAP ERP',
    'Oracle ERP',
    'NetSuite',
    'HubSpot',
    'Workday',
    'ServiceNow',
    'PostgreSQL',
    'MySQL',
    'MongoDB',
    'S3 Bucket',
    'API Gateway',
    'Kafka',
    'Custom Application',
  ],
  extraction: [
    'ETL Pipeline',
    'Fivetran',
    'Airbyte',
    'Stitch',
    'AWS Glue',
    'Azure Data Factory',
    'Informatica',
    'Talend',
    'dbt',
    'API Sync',
    'Batch Extract',
    'Stream Processing',
    'Custom Script',
  ],
  storage: [
    'Snowflake',
    'BigQuery',
    'Redshift',
    'Databricks',
    'Azure Synapse',
    'Data Lake',
    'S3 Data Lake',
    'Data Warehouse',
    'Data Mart',
    'PostgreSQL',
    'Time-series DB',
    'ElasticSearch',
  ],
  transformation: [
    'dbt Models',
    'SQL Views',
    'Spark Jobs',
    'Python Scripts',
    'Databricks Notebooks',
    'Looker LookML',
    'Data Aggregations',
    'ML Pipeline',
    'Data Quality Checks',
    'Business Rules Engine',
  ],
  consumption: [
    'Tableau Dashboard',
    'Power BI Report',
    'Looker Dashboard',
    'Metabase',
    'Excel Reports',
    'Google Sheets',
    'Slack Bot',
    'Email Reports',
    'API Endpoint',
    'Mobile App',
    'Web Application',
    'Jupyter Notebooks',
  ],
};

/**
 * Journey templates for common data flow patterns
 */
export const JOURNEY_TEMPLATES: JourneyTemplate[] = [
  {
    id: 'customer-360',
    name: 'Customer 360 for Sales',
    description: 'Unified customer view from CRM to sales dashboards',
    stages: [
      {
        type: 'source',
        systemName: 'CRM (Salesforce)',
        owner: '',
        latency: 0,
        latencyUnit: 'hours',
        order: 0,
      },
      {
        type: 'extraction',
        systemName: 'ETL Pipeline',
        owner: '',
        latency: 4,
        latencyUnit: 'hours',
        order: 1,
      },
      {
        type: 'storage',
        systemName: 'Data Warehouse',
        owner: '',
        latency: 1,
        latencyUnit: 'hours',
        order: 2,
      },
      {
        type: 'transformation',
        systemName: 'dbt Models',
        owner: '',
        latency: 2,
        latencyUnit: 'hours',
        order: 3,
      },
      {
        type: 'consumption',
        systemName: 'Sales Dashboard',
        owner: '',
        latency: 0,
        latencyUnit: 'hours',
        order: 4,
      },
    ],
  },
  {
    id: 'financial-reporting',
    name: 'Financial Reporting',
    description: 'ERP data to financial close and reporting',
    stages: [
      {
        type: 'source',
        systemName: 'ERP System',
        owner: '',
        latency: 0,
        latencyUnit: 'hours',
        order: 0,
      },
      {
        type: 'extraction',
        systemName: 'Batch Extract',
        owner: '',
        latency: 24,
        latencyUnit: 'hours',
        order: 1,
      },
      {
        type: 'storage',
        systemName: 'Financial Data Mart',
        owner: '',
        latency: 2,
        latencyUnit: 'hours',
        order: 2,
      },
      {
        type: 'transformation',
        systemName: 'Consolidation',
        owner: '',
        latency: 8,
        latencyUnit: 'hours',
        order: 3,
      },
      {
        type: 'consumption',
        systemName: 'Board Reports',
        owner: '',
        latency: 24,
        latencyUnit: 'hours',
        order: 4,
      },
    ],
  },
  {
    id: 'sales-pipeline',
    name: 'Sales Pipeline Analytics',
    description: 'Opportunity data for pipeline forecasting',
    stages: [
      {
        type: 'source',
        systemName: 'CRM Opportunities',
        owner: '',
        latency: 0,
        latencyUnit: 'hours',
        order: 0,
      },
      {
        type: 'extraction',
        systemName: 'API Sync',
        owner: '',
        latency: 1,
        latencyUnit: 'hours',
        order: 1,
      },
      {
        type: 'storage',
        systemName: 'Analytics DB',
        owner: '',
        latency: 0,
        latencyUnit: 'hours',
        order: 2,
      },
      {
        type: 'transformation',
        systemName: 'Pipeline Model',
        owner: '',
        latency: 1,
        latencyUnit: 'hours',
        order: 3,
      },
      {
        type: 'consumption',
        systemName: 'Forecast Dashboard',
        owner: '',
        latency: 0,
        latencyUnit: 'hours',
        order: 4,
      },
    ],
  },
  {
    id: 'operational-dashboard',
    name: 'Operational Dashboard',
    description: 'Real-time operational metrics across systems',
    stages: [
      {
        type: 'source',
        systemName: 'Multiple Systems',
        owner: '',
        latency: 0,
        latencyUnit: 'hours',
        order: 0,
      },
      {
        type: 'extraction',
        systemName: 'Stream Processing',
        owner: '',
        latency: 0,
        latencyUnit: 'hours',
        order: 1,
      },
      {
        type: 'storage',
        systemName: 'Time-series DB',
        owner: '',
        latency: 0,
        latencyUnit: 'hours',
        order: 2,
      },
      {
        type: 'transformation',
        systemName: 'Aggregations',
        owner: '',
        latency: 0,
        latencyUnit: 'hours',
        order: 3,
      },
      {
        type: 'consumption',
        systemName: 'Ops Dashboard',
        owner: '',
        latency: 0,
        latencyUnit: 'hours',
        order: 4,
      },
    ],
  },
];

/**
 * Get a journey template by ID
 */
export function getJourneyTemplate(id: string): JourneyTemplate | undefined {
  return JOURNEY_TEMPLATES.find((t) => t.id === id);
}

/**
 * Generate a unique journey ID
 */
export function generateJourneyId(): string {
  return `journey_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique stage ID
 */
export function generateStageId(): string {
  return `stage_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate total journey latency in hours
 */
export function calculateTotalLatency(stages: DataStage[]): number {
  return stages.reduce((total, stage) => {
    const hours =
      stage.latencyUnit === 'days' ? stage.latency * 24 : stage.latency;
    return total + hours;
  }, 0);
}

/**
 * Format latency for display
 */
export function formatLatency(hours: number): string {
  if (hours === 0) return 'Real-time';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours}h`;
  const days = hours / 24;
  if (days === Math.floor(days)) return `${days}d`;
  return `${days.toFixed(1)}d`;
}

/**
 * Validate journey data
 */
export interface JourneyValidation {
  valid: boolean;
  errors: {
    name?: string;
    stages?: string;
  };
}

export function validateJourney(
  journey: Partial<DataJourney>
): JourneyValidation {
  const errors: JourneyValidation['errors'] = {};

  if (!journey.name?.trim()) {
    errors.name = 'Journey name is required';
  }

  if (!journey.stages || journey.stages.length < MIN_STAGES) {
    errors.stages = `At least ${MIN_STAGES} stages are required`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate stage data
 */
export interface StageValidation {
  valid: boolean;
  errors: {
    systemName?: string;
    latency?: string;
  };
}

export function validateStage(stage: Partial<DataStage>): StageValidation {
  const errors: StageValidation['errors'] = {};

  if (!stage.systemName?.trim()) {
    errors.systemName = 'System name is required';
  }

  if (stage.latency !== undefined && stage.latency < 0) {
    errors.latency = 'Latency cannot be negative';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Check if we can proceed to friction analysis
 */
export function canProceedToFriction(journeys: DataJourney[]): boolean {
  return journeys.length >= 1 && journeys.every((j) => j.stages.length >= MIN_STAGES);
}

/**
 * Create a default stage for a given type
 */
export function createDefaultStage(
  type: StageType,
  order: number
): Omit<DataStage, 'id'> {
  return {
    type,
    systemName: '',
    owner: '',
    latency: 0,
    latencyUnit: 'hours',
    order,
  };
}
