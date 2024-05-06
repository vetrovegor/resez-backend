import { IsOptional, IsBoolean } from 'class-validator';

export class SettingsDto {
    @IsOptional()
    @IsBoolean({
        message: "Поле 'shuffleCards' должно быть логическим значением."
    })
    shuffleCards?: boolean;

    @IsOptional()
    @IsBoolean({
        message: "Поле 'answerOnFront' должно быть логическим значением."
    })
    answerOnFront?: boolean;

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
}
