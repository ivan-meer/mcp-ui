// --- DataAnalysisEngine Types ---
export interface DataAnalysisEngine {
  analyzeDataStructure(data: any, context?: AnalysisContext): Promise<DataStructureAnalysis>; // Now async, added context
  recognizePatterns(data: any, context?: AnalysisContext): PatternMatch[]; // Keep sync or make async if needed later
  inferDataTypes(data: any): TypeInferenceResult; // Keep sync or make async if needed later
  findRelationships(data: any): RelationshipMap;
  suggestVisualizations(analysis: DataStructureAnalysis): VisualizationSuggestion[];
}

export interface AnalysisContext {
  // Placeholder for context properties like user roles, application state, etc.
  [key: string]: any;
}

export interface DataStructureAnalysis {
  dataType: 'array' | 'object' | 'primitive';
  complexity: 'simple' | 'medium' | 'complex';
  recordCount: number; // For arrays
  fieldTypes: FieldTypeMap;
  nestingLevel: number;
  patterns: DetectedPattern[];
  suggestedComponents: ComponentSuggestion[];
}

export interface FieldTypeMap {
  [fieldName: string]: {
    type: string; // e.g., 'string', 'number', 'boolean', 'date', 'array', 'object'
    confidence?: number;
    isArray?: boolean;
    // Could add more metadata like format (email, url), enumValues, etc.
  };
}

export interface DetectedPattern {
  name: string; // e.g., 'ListOfObjects', 'KeyValuePairs', 'TimeSeries'
  confidence: number;
  details?: any;
}

export interface ComponentSuggestion {
  component: 'table' | 'form' | 'chart' | 'card' | 'dashboard' | 'list' | string; // Allow custom components
  confidence: number; // 0-1
  reasoning: string;
  props: ComponentProps; // Initially, this might be generic
  alternatives?: ComponentSuggestion[]; // Changed from ComponentSuggestion[] to avoid self-reference issues if any
}

export interface PatternMatch {
  patternName: string;
  confidence: number;
  matchedData: any; // Portion of data that matches
  suggestedInterpretation?: string;
}

export interface TypeInferenceResult {
  [fieldName: string]: {
    type: string; // 'string', 'number', 'boolean', 'date', 'uuid', 'email', etc.
    confidence: number;
    format?: string; // e.g., date format
  };
}

export interface RelationshipMap {
  [fieldA: string]: Array<{
    fieldB: string;
    relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many' | 'foreign-key';
    confidence: number;
  }>;
}

export interface VisualizationSuggestion {
  chartType: 'bar' | 'line' | 'pie' | 'scatter' | 'table' | string; // Allow custom chart types
  dataMapping: any; // How data fields map to chart axes/values
  confidence: number;
  reasoning?: string;
}

// --- UISchemaGenerator Types ---
export interface UISchemaGenerator {
  generateSchema(analysis: DataStructureAnalysis, metadata?: UIMetadata): UISchema;
  optimizeLayout(schema: UISchema, constraints: LayoutConstraints): OptimizedUISchema;
  validateSchema(schema: UISchema): ValidationResult;
  mergeUserPreferences(schema: UISchema, preferences: UserPreferences): UISchema;
}

// Forward declaration for UIMetadata as it's also defined in server types.
// For now, define a basic version here. It might be consolidated later.
export interface UIMetadata {
  title?: string;
  description?: string;
  preferredComponents?: ComponentType[];
  layoutPreferences?: LayoutPreferences;
  // businessRules?: BusinessRule[]; // Define BusinessRule if needed
  // userPermissions?: Permission[]; // Define Permission if needed
  // customizations?: CustomizationRule[]; // Define CustomizationRule if needed
  [key: string]: any; // Allow extensibility
}

export interface LayoutPreferences {
    density?: 'compact' | 'comfortable' | 'sparse';
    orientation?: 'vertical' | 'horizontal';
    [key: string]: any;
}

export interface LayoutConstraints {
  maxWidth?: number;
  minWidth?: number;
  maxHeight?: number;
  minHeight?: number;
  responsiveBreakpoints?: number[]; // e.g., [600, 900, 1200]
}

export type OptimizedUISchema = UISchema; // Placeholder, can be more specific later

export interface ValidationResult {
  isValid: boolean;
  errors?: Array<{ path: string; message: string }>;
}

export interface UserPreferences {
  theme?: string; // e.g., 'dark', 'light'
  density?: 'compact' | 'comfortable';
  // Other user-specific settings
  [key: string]: any;
}

export interface UISchema {
  version: string;
  type: 'page' | 'component' | 'widget';
  layout: LayoutDefinition;
  components: ComponentDefinition[];
  interactions?: InteractionRule[]; // Optional as per spec diagram
  styling?: StylingConfig;        // Optional
  accessibility?: AccessibilityConfig; // Optional
  validation?: ValidationConfig;    // Optional
}

export type ComponentType = 'AutoTable' | 'AutoForm' | 'AutoChart' | 'AutoCard' | 'AutoList' | 'AutoDashboard' | 'input' | 'button' | 'select' | 'textarea' | 'custom' | string;

export interface ComponentProps {
  [key: string]: any; // Generic props bag
}

export interface ComponentDefinition {
  id: string; // Unique identifier for the component instance
  type: ComponentType;
  props: ComponentProps;
  children?: ComponentDefinition[];
  conditions?: ConditionalRule[];
  events?: EventHandler[];
  data?: DataBinding;
}

export interface ConditionalRule {
  field: string; // Field to check
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  value: any;
  action: 'show' | 'hide' | 'enable' | 'disable';
  targetComponentId?: string; // Optional, defaults to current component
}

export interface EventHandler {
  eventName: 'onClick' | 'onChange' | 'onSubmit' | string; // Common events + custom
  action: 'submitForm' | 'navigateTo' | 'callApi' | 'updateState' | string;
  params?: any; // Parameters for the action
}

export interface DataBinding {
  // Defines how component props map to data source fields
  [propName: string]: {
    sourceField: string; // Path to data in the source (e.g., 'user.profile.name')
    transformation?: string; // Optional transformation function name or definition
  };
}

export interface LayoutDefinition {
  type: 'grid' | 'flex' | 'absolute' | 'flow' | string;
  responsive?: ResponsiveConfig; // Optional
  spacing?: SpacingConfig;     // Optional
  alignment?: AlignmentConfig;   // Optional
  breakpoints?: BreakpointConfig; // Optional
  // Specific props for layout type, e.g., for grid:
  columns?: number | string; // e.g., 12 or 'repeat(auto-fill, minmax(200px, 1fr))'
  rows?: number | string;
  gap?: string | number;
  // Specific props for flex:
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}

export interface ResponsiveConfig {
  [breakpoint: string]: Partial<LayoutDefinition>; // e.g., sm: { columns: 1 }, md: { columns: 2 }
}

export interface SpacingConfig {
  margin?: string | number;
  padding?: string | number;
  // Individual sides: mt, mb, ml, mr, pt, pb, pl, pr
  [key: string]: string | number | undefined;
}

export interface AlignmentConfig {
  horizontal?: 'left' | 'center' | 'right' | 'justify';
  vertical?: 'top' | 'middle' | 'bottom' | 'baseline';
}

export interface BreakpointConfig {
  xs?: number; // e.g., 0
  sm?: number; // e.g., 640
  md?: number; // e.g., 768
  lg?: number; // e.g., 1024
  xl?: number; // e.g., 1280
  xxl?: number; // e.g., 1536
}

export interface InteractionRule {
    trigger: {
        componentId: string;
        event: string; // e.g., 'onClick', 'onDataChange'
    };
    action: {
        type: 'filterData' | 'sortData' | 'navigateTo' | 'updateComponentProps' | 'callApi';
        targetId?: string; // e.g., target componentId for update, or API endpoint
        params: any; // e.g., { filterField: 'status', filterValue: 'active' }
    };
}

export interface StylingConfig {
    theme?: string; // Name of a predefined theme or custom theme object
    inlineStyles?: { [componentId: string]: React.CSSProperties };
    globalCss?: string;
}

export interface AccessibilityConfig {
    enableARIA?: boolean; // Auto-generate ARIA attributes
    focusManagement?: 'auto' | 'manual';
    keyboardNavigation?: boolean;
    contrastMinimum?: 'AA' | 'AAA';
}

export interface ValidationRule {
    type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
    value?: any; // e.g., for minLength, pattern regex
    message: string; // Error message
    validator?: (value: any, formData?: any) => boolean | Promise<boolean>; // For custom validation
}

export interface ValidationConfig {
    // Field-level validation rules
    fields: {
        [fieldPath: string]: ValidationRule[];
    };
    // Form-level validation rules
    form?: ValidationRule[];
}


// --- Placeholder interfaces for other major systems ---

// --- Feedback System Types ---
export interface UISchemaIdentifier {
  id?: string; // A unique ID for the generated schema, if available
  version?: string; // Version of the schema
  contentHash?: string; // Potentially a hash of the schema content
}

export interface UserFeedback {
  timestamp: string; // ISO date-time string
  userId?: string;
  sessionId?: string;

  inputDataSample?: any;
  uiSchemaIdentifier: UISchemaIdentifier;

  overallRating?: number; // 1-5
  easeOfUseRating?: number;
  accuracyOfSuggestionRating?: number;
  comments?: string;

  componentFeedback?: Array<{
    componentId: string;
    issueType: 'IncorrectProps' | 'WrongComponent' | 'StylingIssue' | 'InteractionMissing' | 'Other';
    description: string;
    suggestedChange?: Partial<ComponentDefinition> | string;
  }>;

  alternativeSuggestions?: Array<Partial<ComponentSuggestion>>;

  preferredVariant?: 'A' | 'B' | 'None';

  consentToUseFeedback?: boolean;
}
// --- End Feedback System Types ---

export interface PatternClassification {
    patternName: string;
    confidence: number;
    details?: any;
    modelUsed?: 'tfjs' | 'rule-based' | 'none' | string; // Allow other model types
}

export interface AIPatternRecognizer {
  analyzeWithAI(data: any, promptKey: string): Promise<any>; // Result type depends on prompt, 'any' for now
  classifyDataPattern(data: any): Promise<PatternClassification>; // Updated signature
  learnFromFeedback(feedback: UserFeedback): Promise<void>;
  runABTest(data: any, variants: UISchema[]): Promise<any>; // Placeholder for ABTestResult type, 'any' for now
}

// --- CacheManager Interface ---
export interface CacheManager {
  store(key: string, value: any, ttlSeconds?: number): Promise<void>;
  retrieve<T = any>(key: string): Promise<T | undefined>;
  delete(key: string): Promise<boolean>;
  has(key: string): Promise<boolean>;
  isReady?(): Promise<boolean>; // Optional readiness check
  disconnect?(): Promise<void>; // Optional disconnect
}

export interface PerformanceOptimizer {
  // (To be detailed in Phase 4)
  enableVirtualization(component: ComponentDefinition, threshold: number): void;
  implementLazyLoading(schema: UISchema): OptimizedUISchema;
  // generateCodeSplitting(schema: UISchema): CodeSplitConfig; // Define CodeSplitConfig
  optimizeRendering(component: ComponentDefinition): any; // OptimizedComponent
  // analyzeBundleSize(schema: UISchema): BundleAnalysis; // Define BundleAnalysis
}

export interface ThemeSystem {
  // (To be detailed in Phase 2 & 4)
  // themes: { [name: string]: ThemeConfig }; // Define ThemeConfig
  // createCustomTheme(config: any): ThemeConfig; // CustomThemeConfig
  switchTheme(themeName: string): void;
  // generateBrandTheme(brandColors: any): ThemeConfig; // BrandPalette
}

export interface AccessibilityEngine {
  // (To be detailed in Phase 4)
  // enhanceWithARIA(schema: UISchema): AccessibleUISchema; // Define AccessibleUISchema
  // validateColorContrast(theme: any): any; // ContrastReport, ThemeConfig
  // generateKeyboardHandlers(schema: UISchema): any; // KeyboardNavigationConfig
  // optimizeForScreenReaders(schema: UISchema): any; // ScreenReaderOptimizedSchema
  // validateWCAGCompliance(generatedUI: any): any; // GeneratedUI, WCAGReport
}
