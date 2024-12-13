import { ApiProperty } from '@nestjs/swagger';
import { Subject } from '../subject.entity';

export class CreateSubjectResponseDto {
    @ApiProperty({
        type: () => Subject,
        description: 'Созданный предмет',
        example: {
            subject: 'Информатика',
            slug: 'informatika-1',
            durationMinutes: 240,
            isMark: true,
            isPublished: true,
            subjectTasks: [
                {
                    theme: 'Неорганическая химия',
                    primaryScore: 4,
                    isDetailedAnswer: true,
                    subThemes: [
                        {
                            subTheme: 'Периодическая таблица',
                            id: 328
                        }
                    ],
                    number: 1,
                    id: 347
                }
            ],
            id: 15,
            isArchived: false,
            order: 0,
            createdAt: '2024-11-26T09:10:29.238Z',
            updatedAt: '2024-11-26T09:10:29.238Z'
        }
    })
    subject: Subject;
}
