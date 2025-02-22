import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Locus } from './locus.entity';

@Entity({ name: 'rnc_locus_members' })
export class LocusMember {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'region_id' })
    regionId: number;

    @Column({ name: 'membership_status' })
    membershipStatus: string;

    @Column({ name: 'urs_taxid' })
    ursTaxid: number;

    @ManyToOne(() => Locus, (locus) => locus.members)
    @JoinColumn({ name: 'locus_id' })
    locus_id: Locus;
}