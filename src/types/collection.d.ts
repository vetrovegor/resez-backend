import { UserPreview } from "./user"

export type QAPair = {
    question: string,
    answer: string
}

export type QADTO = QAPair & {
    id: number
}

export type CollectionBodyDTO = {
    collection: string,
    description: string,
    isPrivate: boolean,
    QAPairs: QAPair[]
}

export type CollectionShortInfo = {
    id: number,
    collection: string,
    pairsCount: number,
    description: string,
    isPrivate: boolean,
    createdAt: Date,
    updatedAt: Date,
    user: UserPreview
}

export type CollectionFullInfo = CollectionShortInfo & {
    QAPairs: QAPair[]
}