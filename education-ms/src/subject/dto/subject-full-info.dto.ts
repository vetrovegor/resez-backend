import { SubTheme } from '@sub-theme/sub-theme.entity';
import { SubjectTask } from '@subject-task/subject-task.entity';
import { Subject } from '@subject/subject.entity';

class SubThemeWithTasksCount extends SubTheme {
    tasksCount: number;
}

class SubjectTaskWithTasksCount extends SubjectTask {
    tasksCount: number;
    subThemes: SubThemeWithTasksCount[];
}

export class SubjectFullInfo extends Subject {
    subjectTasks: SubjectTaskWithTasksCount[];
}
