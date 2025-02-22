import { Test, TestingModule } from '@nestjs/testing';
import { LocusController } from './locus.controller';
import { LocusService } from './locus.service';
import { ForbiddenException } from '@nestjs/common';
import { SideloadingOption } from './sideloading-options.enum';

describe('LocusController', () => {
    let controller: LocusController;
    let service: LocusService;

    const mockService = {
        getLocusWithFilters: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LocusController],
            providers: [{ provide: LocusService, useValue: mockService }],
        }).compile();

        controller = module.get<LocusController>(LocusController);
        service = module.get<LocusService>(LocusService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return filtered locus data for admin with sideloading', async () => {
        const filters = { id: 1, assemblyId: '123' };
        const sortBy = ['id', 'assemblyId'];
        const result = [{ id: 1, assemblyId: '123' }];

        mockService.getLocusWithFilters.mockResolvedValue(result);

        const response = await controller.getLocus(
            SideloadingOption.LOCUS_MEMBERS,
            'admin',
            1,
            1000,
            filters,
            sortBy,
        );

        expect(service.getLocusWithFilters).toHaveBeenCalledWith(
            SideloadingOption.LOCUS_MEMBERS,
            'admin',
            1,
            1000,
            filters,
            sortBy,
        );

        expect(response).toEqual(result);
    });

    it('should throw ForbiddenException if non-admin uses sideloading', async () => {
        const filters = { membershipStatus: 'active' };

        await expect(
            controller.getLocus(SideloadingOption.LOCUS_MEMBERS, 'normal', 1, 1000, filters),
        ).rejects.toThrow(ForbiddenException);

        expect(service.getLocusWithFilters).not.toHaveBeenCalled();
    });

    it('should return locus data for normal user without sideloading', async () => {
        const filters = { id: 2 };
        const result = [{ id: 2 }];

        mockService.getLocusWithFilters.mockResolvedValue(result);

        const response = await controller.getLocus(undefined, 'normal', 1, 1000, filters);

        expect(service.getLocusWithFilters).toHaveBeenCalledWith(
            undefined,
            'normal',
            1,
            1000,
            filters,
            undefined,
        );
        expect(response).toEqual(result);
    });

    it('should restrict limited users to allowed regionIds', async () => {
        const filters = { regionId: [86118093, 99999999] }; // Only first regionId is allowed
        const result = [{ regionId: 86118093 }];

        mockService.getLocusWithFilters.mockResolvedValue(result);

        const response = await controller.getLocus(undefined, 'limited', 1, 1000, filters);

        expect(service.getLocusWithFilters).toHaveBeenCalledWith(
            undefined,
            'limited',
            1,
            1000,
            filters,
            undefined,
        );
        expect(response).toEqual(result);
    });

    it('should use default pagination when not provided', async () => {
        const result = [{ id: 3 }];
        mockService.getLocusWithFilters.mockResolvedValue(result);

        const response = await controller.getLocus(undefined, 'admin');

        expect(service.getLocusWithFilters).toHaveBeenCalledWith(
            undefined,
            'admin',
            1, // Default page
            1000, // Default limit
            undefined,
            undefined,
        );
        expect(response).toEqual(result);
    });

    it('should apply sorting for valid fields only', async () => {
        const sortBy = ['id', 'invalidField', 'assemblyId'];
        const validSortBy = ['id', 'assemblyId']; // Assuming the controller filters invalid fields
        const result = [{ id: 4 }];

        mockService.getLocusWithFilters.mockResolvedValue(result);

        const response = await controller.getLocus(
            undefined,
            'admin',
            1,
            1000,
            undefined,
            sortBy,
        );

        expect(service.getLocusWithFilters).toHaveBeenCalledWith(
            undefined,
            'admin',
            1,
            1000,
            undefined,
            validSortBy,
        );
        expect(response).toEqual(result);
    });
});