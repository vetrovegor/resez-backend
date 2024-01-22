import { UserPreview } from "./user"

export type qaPair = {
    question: string,
    answer: string
}

export type Card = qaPair & {
    id: number
}

export type CollectionBodyDTO = {
    collection: string,
    description: string,
    isPrivate: boolean,
    QAPairs: qaPair[]
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
    QAPairs: qaPair[]
}

export type CollectionSettings = {
    isShuffleCards: boolean,
    isDefinitionCardFront: boolean
}