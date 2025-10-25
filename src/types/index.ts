export interface Course {
  id: string;
  code: string;
  name: string;
  instructor_id: string;
  completed?: number;
  labs?: number;
  progress?: number;
  students?: number;
  submissions?: number;
  avgCompletion?: number;
}

export interface RecentLab {
  id: number;
  name: string;
  course: string;
  dueDate: string;
  status: 'in-progress' | 'not-started' | 'completed';
}

export interface Experiment {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
}
