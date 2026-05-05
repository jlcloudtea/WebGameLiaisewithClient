export type DocumentType = 'CONFIRMATION' | 'ADDITIONAL' | 'APPROVAL' | 'TRAINING' | 'USER_DOC';

export interface ClientMessage {
  id: string;
  content: string;
  round: number;
  isVerbalTrap: boolean;
  gameSessionId: string;
  createdAt: string;
}

export interface PlayerDocument {
  id: string;
  documentType: DocumentType;
  content: string;
  roundSubmitted: number;
  scoreEarned: number;
  feedback: string;
  gameSessionId: string;
  createdAt: string;
}

export interface GameSession {
  id: string;
  currentRound: number;
  isComplete: boolean;
  teamId: string;
  createdAt: string;
  updatedAt: string;
  messages: ClientMessage[];
  documents: PlayerDocument[];
}

export interface Team {
  id: string;
  name: string;
  password: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  sessions: GameSession[];
}

export interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  score: number;
  completedAt: string | null;
}

export interface SubmitResponse {
  document: PlayerDocument;
  gameSession: GameSession;
}

export const ROUND_DOCUMENT_TYPES: Record<number, DocumentType> = {
  1: 'CONFIRMATION',
  2: 'ADDITIONAL',
  3: 'APPROVAL',
  4: 'TRAINING',
  5: 'USER_DOC',
};

export const TOTAL_ROUNDS = 5;
export const ROUND_TIME_SECONDS = 300;

export interface RoundConfig {
  round: number;
  documentType: DocumentType;
  title: string;
  description: string;
  fields: FormFieldConfig[];
}

export interface FormFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'checkbox' | 'checkbox-group';
  options?: string[];
  placeholder?: string;
}

export const ROUND_CONFIGS: RoundConfig[] = [
  {
    round: 1,
    documentType: 'CONFIRMATION',
    title: 'Confirmation Document',
    description: 'Document the agreed service and timeframe with the client.',
    fields: [
      { key: 'service', label: 'Service Provided', type: 'text', placeholder: 'e.g., Network installation' },
      { key: 'timeframe', label: 'Timeframe', type: 'text', placeholder: 'e.g., 2 weeks' },
    ],
  },
  {
    round: 2,
    documentType: 'ADDITIONAL',
    title: 'Additional / Amendment Document',
    description: 'Handle the client\'s additional requirements properly.',
    fields: [
      { key: 'amendOriginal', label: 'Amend original document?', type: 'checkbox' },
      { key: 'additionalRequirements', label: 'Additional Requirements', type: 'text', placeholder: 'Describe the additional requirements' },
    ],
  },
  {
    round: 3,
    documentType: 'APPROVAL',
    title: 'Approval Document',
    description: 'Get proper written approval for the goods and services.',
    fields: [
      { key: 'standard', label: 'Standard of goods', type: 'text', placeholder: 'e.g., Industry standard Grade A' },
      { key: 'price', label: 'Price', type: 'text', placeholder: 'e.g., $5,000' },
      { key: 'time', label: 'Time for work', type: 'text', placeholder: 'e.g., 30 days' },
      { key: 'ongoing', label: 'Ongoing services', type: 'text', placeholder: 'e.g., Monthly maintenance' },
      { key: 'writtenApproval', label: 'Client gave written approval', type: 'checkbox' },
    ],
  },
  {
    round: 4,
    documentType: 'TRAINING',
    title: 'Training Document',
    description: 'Document the training arrangements for the client.',
    fields: [
      {
        key: 'trainingTypes',
        label: 'Training Types',
        type: 'checkbox-group',
        options: ['Installation', 'Troubleshooting', 'Maintenance', 'Initial Training'],
      },
      { key: 'supportDetails', label: 'Support details', type: 'text', placeholder: 'Describe support arrangements' },
    ],
  },
  {
    round: 5,
    documentType: 'USER_DOC',
    title: 'User Documentation',
    description: 'Document the user documentation to be provided.',
    fields: [
      {
        key: 'documentationTypes',
        label: 'Documentation Types',
        type: 'checkbox-group',
        options: ['Web-based', 'Hard-copy', 'Electronic training', 'Development docs', 'Videos'],
      },
      { key: 'specifics', label: 'Specifics', type: 'textarea', placeholder: 'Describe the documentation specifics' },
    ],
  },
];
