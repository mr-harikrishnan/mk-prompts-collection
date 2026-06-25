export interface PromptVariable {
  name: string; // e.g. "boy_name"
  label: string; // e.g. "Boy Name"
  defaultValue: string; // e.g. "Jack"
}

export interface Prompt {
  id: string;
  title: string;
  category: string;
  shortDesc: string;
  longDesc: string;
  template: string; // E.g. "A couple walking hand in hand in the rain in {location}, style of {art_style}."
  image: string; // URL (like /images/love_couples.png) or Base64 data URI
  variables: PromptVariable[];
  tags: string[];
  copyCount: number;
  stars: number; // calculated average star rating
  totalReviews: number;
  promptKey?: string;
  isCustomizable?: boolean;
}

export interface Feedback {
  id: string;
  rating: number; // 1 to 5
  reviewer: string;
  date: string;
  comment: string;
}

export interface CreatorSettings {
  pageName: string;
  instagramUsername: string;
  instagramLink: string;
  followersText: string;
  accessKey: string;
}

export interface CopyRecord {
  date: string;
  promptTitle: string;
  category: string;
}

export interface RetentionCohort {
  week: string; // e.g. "W1", "W2"
  percentage: number; // e.g. 85
}

export interface VisitorMetrics {
  totalVisits: number;
  totalCopies: number;
  copiesHistory: CopyRecord[];
  retentionCohort: RetentionCohort[];
}
