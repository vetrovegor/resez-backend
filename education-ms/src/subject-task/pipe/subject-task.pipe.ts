import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { SubjectDto } from '@subject/dto/subject.dto';

@Injectable()
export class SubjectTaskPipe implements PipeTransform {
    transform(dto: SubjectDto) {
        const { subjectTasks } = dto;

        let totalPrimaryScore = 0;
        let i = 1;

        subjectTasks.forEach(subjectTask => {
            const primaryScore = Number(subjectTask.primaryScore);

            totalPrimaryScore += primaryScore;

            const subThemes = subjectTask.subThemes.map(
                subTheme => subTheme.subTheme
            );

            if (new Set(subThemes).size != subThemes.length) {
                throw new BadRequestException(
                    'Не должно быть повторяющихся подтем'
                );
            }

            subjectTask.number = i;
            i++;
        });

        if (totalPrimaryScore < 1 || totalPrimaryScore > 100) {
            throw new BadRequestException(
                'Сумма первичных баллов должна быть от 1 до 100'
            );
        }

        return dto;
    }
}
