import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { LocusService } from './locus.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { SideloadingOption } from './sideloading-options.enum'; // ✅ Import the Enum

@Controller('locus')
export class LocusController {
    constructor(private readonly locusService: LocusService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'normal', 'limited')
    async getLocus(
        @Query('sideloading') sideloading?: string,
        @Query('role') role?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('id') id?: string,
        @Query('assemblyId') assemblyId?: string,
        @Query('regionId') regionId?: string,
        @Query('membershipStatus') membershipStatus?: string,
        @Query('sortBy') sortBy?: string
    ) {

        const pageNumber = page ? parseInt(page, 10) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 10;

        const idNumber = id ? parseInt(id, 10) : undefined;

        const assemblyIdString = assemblyId ?? undefined;

        const regionIdArray = regionId ? regionId.split(',').map(id => parseInt(id, 10)) : undefined;

        const sortFields = sortBy ? sortBy.split(',') : undefined;

        const sideloadingEnum = sideloading && Object.values(SideloadingOption).includes(sideloading as SideloadingOption)
            ? (sideloading as SideloadingOption)
            : undefined;


        const filters = {
            id: idNumber,
            assemblyId: assemblyIdString,
            regionId: regionIdArray,
            membershipStatus,
        };

        return this.locusService.getLocusWithFilters(sideloadingEnum, 'admin', pageNumber, limitNumber, filters, sortFields);
    }
}