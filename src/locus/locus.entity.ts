import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { LocusMember } from './locus-member.entity';

@Entity({ name: 'rnc_locus' })
export class Locus {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'assembly_id' })
    assemblyId: string;

    @Column({ name: 'locus_name' })
    locusName: string;

    @Column({ name: 'public_locus_name' })
    publicLocusName: string;

    @Column({ name: 'chromosome' })
    chromosome: string;

    @Column({ name: 'strand' })
    strand: string;

    @Column({ name: 'locus_start' })
    locusStart: number;

    @Column({ name: 'locus_stop' })
    locusStop: number;

    @OneToMany(() => LocusMember, (locusMember) => locusMember.locus_id)
    members: LocusMember[];
}