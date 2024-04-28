export type SubjectBodyDTO = {
    subject: string,
    slug: string,
    subjectTasks: SubjectTaskBodyDTO[],
    durationMinutes: number,
    isMark: boolean,
    isPublished: boolean
}

export type SubjectTaskBodyDTO = {
    id: number,
    theme: string,
    primaryScore: number,
    isDetailedAnswer: boolean,
    subThemes: SubThemeBodyDTO[]
}   

export type SubThemeBodyDTO = {
    id: number,
    subTheme: string
}

export type SubjectShortInfo = {
    id: number,
    subject: string,
    slug: string,
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
    slug: string,
    durationMinutes: number,
    isMark: boolean,
    isPublished: boolean,
    subjectTasks: SubjectTaskDTO[]
}

export type ScoreConversionItem = {
    id: number,
    primaryScore: number,
    secondaryScore: number,
    minScore: number,
    maxScore: number,
    mark: number,
    isRed: boolean,
    isGreen: boolean
}

export type ScoreConversionDTO = {
    isMark: boolean,
    scoreConversion: ScoreConversionItem[]
}