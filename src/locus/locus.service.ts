import {ForbiddenException, Injectable} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Locus } from './locus.entity';
import { LocusMember } from './locus-member.entity';
import { SideloadingOption } from './sideloading-options.enum';

@Injectable()
export class LocusService {
    constructor(
        @InjectRepository(Locus)
        private locusRepository: Repository<Locus>,
        @InjectRepository(LocusMember)
        private locusMemberRepository: Repository<LocusMember>,
    ) {}


    async getLocusWithFilters(
        sideloading?: SideloadingOption,
        role?: string,
        page: number = 1,
        limit: number = 1000,
        filters?: { id?: number; assemblyId?: string; regionId?: number[]; membershipStatus?: string },
        sortBy?: string[]
    ) {
        console.log('User Role:', role);

        const query = this.locusRepository.createQueryBuilder('locus')
            .leftJoinAndSelect('locus.members', 'locus_members');

        query.select(['locus', 'locus_members']);

        if (role !== 'admin' && sideloading === SideloadingOption.LOCUS_MEMBERS) {
            throw new ForbiddenException('Only admin users can use sideloading');
        }



        if (role == 'admin' && sideloading !== SideloadingOption.LOCUS_MEMBERS) {
            query.select(['locus']);
        }


        if (role === 'normal') {
            query.select(['locus']);
        }

        if (filters?.id) query.andWhere('locus.id = :id', { id: filters.id });
        if (filters?.assemblyId) query.andWhere('locus.assembly_id = :assemblyId', { assemblyId: filters.assemblyId });
        if (filters?.regionId?.length) query.andWhere('locus_members.region_id IN (:...regionId)', { regionId: filters.regionId });
        if (filters?.membershipStatus) query.andWhere('locus_members.membership_status = :membershipStatus', { membershipStatus: filters.membershipStatus });

        if (role === 'limited') {
            query.andWhere('locus_members.region_id IN (:...allowedRegions)', {
                allowedRegions: [86118093, 86696489, 88186467]
            });
        }

        if (role === 'admin' && sideloading === SideloadingOption.LOCUS_MEMBERS) {
            query.andWhere('locus_members.id IN (' +
                'SELECT lm.id FROM rnc_locus_members lm ' +
                'WHERE lm.locus_id = locus.id ' +
                'ORDER BY lm.id ASC ' +
                'LIMIT 1' +
                ')');
        }

        if (sortBy && sortBy.length > 0) {
            sortBy.forEach(field => {
                query.addOrderBy(`locus.${field}`, 'ASC');
            });
        }

        query.take(limit).skip((page - 1) * limit);

        console.log('Final Query:', query.getQuery());
        console.log('Final Params:', query.getParameters());

        return query.getMany();
    }
}