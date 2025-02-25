import { Test, TestingModule } from '@nestjs/testing';
import { LocusController } from './locus.controller';
import { LocusService } from './locus.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SideloadingOption } from './sideloading-options.enum';
import { ForbiddenException } from '@nestjs/common';

const mockLocusWithoutMembers = {
    id: 155149,
    assemblyId: "TAIR10",
    locusName: "1e92f448570b4e398ad9616368ec2cad3b0a1639a2f739ddbc60c04c9174e2c8@3/14211618-14211737:1",
    publicLocusName: "5118AB09C56BCBF0",
    chromosome: "3",
    strand: "1",
    locusStart: 14211618,
    locusStop: 14211737,
};

const mockLocusWithMembers = {
    ...mockLocusWithoutMembers,
    members: [
        {
            id: 466336,
            regionId: 31302282,
            membershipStatus: "highlighted",
            ursTaxid: "URS0000518072_3702",
        },
    ],
};

describe('LocusController', () => {
    let controller: LocusController;
    let service: LocusService;

    const mockLocusService = {
        getLocusWithFilters: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LocusController],
            providers: [{ provide: LocusService, useValue: mockLocusService }],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn().mockReturnValue(true) })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: jest.fn().mockReturnValue(true) })
            .compile();

        controller = module.get<LocusController>(LocusController);
        service = module.get<LocusService>(LocusService);
    });


        describe('Admin Access', () => {
            it('should pass the correct id to the service', async () => {
                const mockLocus = { id: 155149, assemblyId: 'TAIR10' };
                mockLocusService.getLocusWithFilters.mockResolvedValue([mockLocus]);

                const result = await controller.getLocus(
                    null,     // sideloading
                    'admin',  // role
                    '1',      // page
                    '10',     // limit
                    155149  // id
                );

                expect(service.getLocusWithFilters).toHaveBeenCalledWith(
                    undefined, // sideloading is undefined (not null)
                    'admin',
                    1,
                    10,
                    { id: 155149, assemblyId: undefined, membershipStatus: undefined, regionId: undefined },
                    ['id', 'assemblyId']
                );

                expect(result).toEqual([mockLocus]);
            });

            it('should throw ForbiddenException for disallowed roles', async () => {
                mockLocusService.getLocusWithFilters.mockImplementation(() => {
                    throw new ForbiddenException('Access denied');
                });

                await expect(
                    controller.getLocus(null, 'admin', '1', '10', 155149)
                ).rejects.toThrow(ForbiddenException);

                expect(service.getLocusWithFilters).toHaveBeenCalledWith(
                    undefined,
                    'admin',
                    1,
                    10,
                    { id: 155149, assemblyId: undefined, membershipStatus: undefined, regionId: undefined },
                    ['id', 'assemblyId']
                );
            });

            it('should return locus with members when sideloading is used by admin', async () => {
                mockLocusService.getLocusWithFilters.mockResolvedValue([mockLocusWithMembers]);

                const result = await controller.getLocus(
                    SideloadingOption.LOCUS_MEMBERS, // Corrected enum value
                    'admin',                         // role
                    '1',                             // page
                    '10',                            // limit
                    155149                         // id
                );

                expect(service.getLocusWithFilters).toHaveBeenCalledWith(
                    SideloadingOption.LOCUS_MEMBERS,
                    'admin',
                    1,
                    10,
                    { id: 155149, assemblyId: undefined, membershipStatus: undefined, regionId: undefined },
                    ['id', 'assemblyId']
                );

                expect(result).toEqual([mockLocusWithMembers]);
            });
            it('should filter by membershipStatus when provided', async () => {
                const membershipStatus = 'highlighted';

                // Mock the service response
                mockLocusService.getLocusWithFilters.mockResolvedValueOnce([mockLocusWithMembers]);

                // Call the controller with the membershipStatus parameter
                const result = await controller.getLocus(
                    undefined,        // sideloading
                    'admin',          // role
                    '1',              // page (string from query)
                    '10',             // limit (string from query)
                    undefined,        // id
                    undefined,        // assemblyId
                    undefined,        // regionId
                    membershipStatus  // membershipStatus (string in query)
                );

                // Verify the service is called with the expected parameters
                expect(mockLocusService.getLocusWithFilters).toHaveBeenCalledWith(
                    undefined,        // sideloading
                    'admin',          // role
                    1,                // page (converted to number)
                    10,               // limit (converted to number)
                    {
                        id: undefined,
                        assemblyId: undefined,
                        regionId: undefined,
                        membershipStatus, // should match the provided membershipStatus
                    },
                    ['id', 'assemblyId'] // sorting fields
                );

                expect(result).toEqual([mockLocusWithMembers]);
            });
            it('should apply sorting and pagination correctly', async () => {
                const mockSortedLocus = [
                    { id: 155148, assemblyId: 'TAIR09' },
                    { id: 155149, assemblyId: 'TAIR10' },
                ];

                mockLocusService.getLocusWithFilters.mockResolvedValue(mockSortedLocus);

                const result = await controller.getLocus(
                    undefined,    // sideloading
                    'admin',      // role
                    '2',          // page (as string)
                    '5',          // limit (as string)
                    undefined,    // id
                    undefined,    // assemblyId
                    undefined,    // regionId
                    undefined,    // membershipStatus
                    'assemblyId,id' // ✅ Pass sorting as a single string
                );

                expect(service.getLocusWithFilters).toHaveBeenCalledWith(
                    undefined,    // sideloading
                    'admin',      // role
                    2,            // page (converted to number)
                    5,            // limit (converted to number)
                    {
                        id: undefined,
                        assemblyId: undefined,
                        regionId: undefined,
                        membershipStatus: undefined,
                    },
                    ['assemblyId', 'id'] // ✅ Converted inside controller
                );

                expect(result).toEqual(mockSortedLocus);
            });
            it('should filter by assemblyId for admin users', async () => {
                const mockLocus = { id: 155149, assemblyId: 'TAIR10' };
                mockLocusService.getLocusWithFilters.mockResolvedValue([mockLocus]);

                const result = await controller.getLocus(
                    undefined,  // sideloading
                    'admin',    // role
                    '1',        // page (string as expected by @Query)
                    '10',       // limit (string)
                    undefined,  // id
                    'TAIR10',   // assemblyId
                    undefined,  // regionId
                    undefined,  // membershipStatus
                    undefined   // sortBy
                );

                expect(service.getLocusWithFilters).toHaveBeenCalledWith(
                    undefined,
                    'admin',
                    1, // Converted inside controller
                    10, // Converted inside controller
                    { id: undefined, assemblyId: 'TAIR10', membershipStatus: undefined, regionId: undefined },
                    ['id', 'assemblyId']
                );

                expect(result).toEqual([mockLocus]);
            });
    });
    describe('Normal User Access', () => {
        it('should return data from rl table only without sideloading', async () => {
            const mockLocus = { id: 155149, assemblyId: 'TAIR10' };
            mockLocusService.getLocusWithFilters.mockResolvedValue([mockLocus]);
            console.log(mockLocusService.getLocusWithFilters.mockResolvedValue([mockLocus]))
            const result = await controller.getLocus(
                undefined,   // sideloading not allowed for normal users
                'normal',    // role
                '1',         // page
                '10',        // limit
                155149       // id filter
            );

            expect(service.getLocusWithFilters).toHaveBeenCalledWith(
                undefined,
                'normal',
                1,
                10,
                { id: 155149, assemblyId: undefined, membershipStatus: undefined, regionId: undefined },
                ['id', 'assemblyId']
            );

            expect(result).toEqual([mockLocus]);
        });

        it('should throw ForbiddenException when normal user tries to use sideloading', async () => {
            mockLocusService.getLocusWithFilters.mockImplementation(() => {
                throw new ForbiddenException('Only admin users can use sideloading');
            });

            await expect(
                controller.getLocus(
                    SideloadingOption.LOCUS_MEMBERS,
                    'normal'
                )
            ).rejects.toThrow(ForbiddenException);
        });
        it('should filter by assemblyId for normal users', async () => {
            const mockLocus = { id: 155149, assemblyId: 'TAIR10' };
            mockLocusService.getLocusWithFilters.mockResolvedValue([mockLocus]);

            const result = await controller.getLocus(
                undefined,  // sideloading
                'admin',    // role
                '1',        // page (string as expected by @Query)
                '10',       // limit (string)
                undefined,  // id
                'TAIR10',   // assemblyId
                undefined,  // regionId
                undefined,  // membershipStatus
                undefined   // sortBy
            );

            expect(service.getLocusWithFilters).toHaveBeenCalledWith(
                undefined,
                'admin',
                1, // Converted inside controller
                10, // Converted inside controller
                { id: undefined, assemblyId: 'TAIR10', membershipStatus: undefined, regionId: undefined },
                ['id', 'assemblyId']
            );

            expect(result).toEqual([mockLocus]);
        });
    });
    describe('Limited User Access', () => {
        const allowedRegions = [86118093, 86696489, 88186467];

        it('should return data when regionId is within allowed regions', async () => {
            const mockLocus = { id: 155150, assemblyId: 'TAIR10', regionId: 86118093 };
            mockLocusService.getLocusWithFilters.mockResolvedValue([mockLocus]);

            const result = await controller.getLocus(
                undefined,          // no sideloading
                'limited',          // role
                '1',                // page
                '10',               // limit
                undefined,          // id
                undefined,          // assemblyId
                '86118093'          // regionId (allowed)
            );

            expect(service.getLocusWithFilters).toHaveBeenCalledWith(
                undefined,
                'limited',
                1,
                10,
                { id: undefined, assemblyId: undefined, membershipStatus: undefined, regionId: [86118093] },
                ['id', 'assemblyId']
            );

            expect(result).toEqual([mockLocus]);
        });

        it('should throw ForbiddenException when regionId is not in allowed regions', async () => {
            mockLocusService.getLocusWithFilters.mockImplementation(() => {
                throw new ForbiddenException('You do not have access to the requested region(s).');
            });

            await expect(
                controller.getLocus(
                    undefined,
                    'limited',
                    '1',
                    '10',
                    undefined,
                    undefined,
                    '99999999'
                )
            ).rejects.toThrow(ForbiddenException);
        });
    });
});
