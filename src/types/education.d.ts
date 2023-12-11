// переименовать на Post или Body
export type SubjectBodyDTO = {
    subject: string,
    subjectTasks: SubjectTaskBodyDTO[],
    durationMinutes: number,
    isMark: boolean,
    isPublished: boolean
}

// переименовать на Post или Body
export type SubjectTaskBodyDTO = {
    id: number,
    theme: string,
    primaryScore: number,
    isDetailedAnswer: boolean,
    subThemes: SubThemeBodyDTO[]
}   

// переименовать на Post или Body
export type SubThemeBodyDTO = {
    id: number,
    subTheme: string
}

export type SubjectShortInfo = {
    id: number,
    subject: string,
    isPublished: boolean,
    subjectTasksCount: number,
    tasksCount: number
}

export type SubThemeDTO = {
    id: number,
    subTheme: string,
    tasksCount: number
}

export type SubjectTaskDTO = {
    id: number,
    number: number,
    theme: string,
    primaryScore: number,
    isDetailedAnswer: boolean,
    totalTasksCount: number,
    subThemes: SubThemeDTO[]
}

export type SubjectFullInfo = {
    id: number,
    subject: string,
    durationMinutes: number,
    isMark: boolean,
    isPublished: boolean,
    subjectTasks: SubjectTaskDTO[]
}