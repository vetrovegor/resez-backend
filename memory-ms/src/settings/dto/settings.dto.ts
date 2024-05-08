import { IsOptional, IsBoolean, IsInt, ValidateIf } from 'class-validator';

export class SettingsDto {
    // карточки
    @IsOptional()
    @IsBoolean({
        message: "Поле 'shuffleCards' должно быть логическим значением."
    })
    shuffleCards?: boolean;

    @IsOptional()
    @IsBoolean({
        message: "Поле 'cardsAnswerOnFront' должно быть логическим значением."
    })
    cardsAnswerOnFront?: boolean;

    // зачучивание
    @IsOptional()
    @IsBoolean({
        message: "Поле 'shuffleMemorization' должно быть логическим значением."
    })
    shuffleMemorization?: boolean;

    @IsOptional()
    @IsBoolean({
        message:
            "Поле 'showAnswerImmediately' должно быть логическим значением."
    })
    showAnswerImmediately?: boolean;

    // тест
    @IsOptional()
    @IsBoolean({
        message: "Поле 'trueFalseMode' должно быть логическим значением."
    })
    trueFalseMode?: boolean;

    @IsOptional()
    @IsBoolean({
        message: "Поле 'writeMode' должно быть логическим значением."
    })
    writeMode?: boolean;

    @IsOptional()
    @IsBoolean({
        message: "Поле 'answerChoiceMode' должно быть логическим значением."
    })
    answerChoiceMode?: boolean;

    @IsOptional()
    @IsInt({ message: "Поле 'maxQuestions' должно быть целым числом." })
    maxQuestions?: number;

    @IsOptional()
    @IsBoolean({
        message: "Поле 'shuffleTest' должно быть логическим значением."
    })
    shuffleTest?: boolean;

    @IsOptional()
    @IsBoolean({
        message: "Поле 'testAnswerOnFront' должно быть логическим значением."
    })
    testAnswerOnFront?: boolean;
}
