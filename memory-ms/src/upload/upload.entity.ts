import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
    name: 'uploads'
})
export class Upload {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'file_name', nullable: true })
    fileName: string;

    @Column({ name: 'user_id' })
    userId: number;
}
