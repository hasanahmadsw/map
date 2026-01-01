# Solutions and Services Refactoring Documentation

## Overview

This document describes the refactoring of the Solutions and Services modules. The main goal was to convert Solutions from a dynamic database entity to a static enum-based configuration, and update Services to reference this enum instead of maintaining a many-to-many relationship.

## Date

Refactoring completed: 2025

---

## Summary of Changes

### Solutions Module

- **Before**: Dynamic entity with database table, CRUD operations, and relationships
- **After**: Static enum-based configuration with simple read-only endpoints

### Services Module

- **Before**: Many-to-many relationship with Solutions via junction table
- **After**: Single enum reference (`solutionKey`) directly on Service entity

---

## 1. Solutions Module Changes

### 1.1 Removed Components

#### Deleted Files:

- `src/modules/solutions/entities/solution.entity.ts` - Entity removed
- `src/modules/solutions/services/solutions.service.ts` - CRUD service removed
- `src/modules/solutions/services/solutions-read.service.ts` - Read service removed
- `src/modules/solutions/services/solutions-crud.service.ts` - CRUD service removed
- All DTOs related to Solutions CRUD operations:
  - `src/modules/solutions/dtos/request/create-solution.dto.ts`
  - `src/modules/solutions/dtos/request/update-solution.dto.ts`
  - `src/modules/solutions/dtos/query/solution-filter.dto.ts`
  - `src/modules/solutions/dtos/response/solution-response.dto.ts` (replaced with config DTO)

#### Removed Endpoints:

- `POST /admin/solutions` - Create solution
- `GET /admin/solutions` - List solutions (admin)
- `GET /admin/solutions/:id` - Get solution by ID
- `PATCH /admin/solutions/:id` - Update solution
- `DELETE /admin/solutions/:id` - Delete solution
- `PATCH /admin/solutions/:id/publish` - Publish solution
- `PATCH /admin/solutions/:id/unpublish` - Unpublish solution
- `GET /solutions/published` - Get published solutions
- `GET /solutions/featured` - Get featured solutions
- `GET /solutions/slug/:slug` - Get solution by slug

### 1.2 New Components

#### Created Files:

**1. Enum Definition**

- `src/modules/solutions/solution-key.enum.ts`

```typescript
export enum SolutionKey {
  PRODUCTION = 'PRODUCTION',
  EVENTS = 'EVENTS',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
}
```

**2. Static Configuration**

- `src/modules/solutions/solutions.config.ts`

```typescript
export interface SolutionConfig {
  key: SolutionKey;
  slug: string;
  name: string;
  icon?: string;
  description?: string;
  shortDescription?: string;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  featuredImage?: string;
}

export const SOLUTIONS_CONFIG: SolutionConfig[] = [
  {
    key: SolutionKey.PRODUCTION,
    slug: 'production',
    name: 'Production',
    // ... configuration
  },
  // ... other solutions
];
```

**3. Config Service**

- `src/modules/solutions/services/solutions-config.service.ts`

```typescript
@Injectable()
export class SolutionsConfigService {
  getAll(): SolutionConfig[] {
    return SOLUTIONS_CONFIG;
  }

  getByKey(key: SolutionKey): SolutionConfig | undefined {
    return SOLUTIONS_CONFIG.find((s) => s.key === key);
  }
}
```

**4. Response DTO**

- `src/modules/solutions/dtos/response/solution-config-response.dto.ts`

```typescript
export class SolutionConfigResponseDto {
  key: SolutionKey;
  slug: string;
  name: string;
  // ... other fields

  static fromConfig(config: SolutionConfig): SolutionConfigResponseDto {
    // ... mapping logic
  }
}
```

**5. Updated Controller**

- `src/modules/solutions/controllers/solutions.controller.ts`

```typescript
@Controller()
export class SolutionsController {
  constructor(private readonly solutionsConfigService: SolutionsConfigService) {}

  @Get('solutions')
  @SerializeResponse(SolutionConfigResponseDto)
  getAll(): SolutionConfigResponseDto[] {
    return this.solutionsConfigService.getAll().map((config) => SolutionConfigResponseDto.fromConfig(config));
  }

  @Get('solutions/:key')
  @SerializeResponse(SolutionConfigResponseDto)
  getByKey(@Param('key') key: string): SolutionConfigResponseDto | null {
    const solutionKey = key.toUpperCase() as SolutionKey;
    const config = this.solutionsConfigService.getByKey(solutionKey);
    return config ? SolutionConfigResponseDto.fromConfig(config) : null;
  }
}
```

**6. Updated Module**

- `src/modules/solutions/solutions.module.ts`

```typescript
@Module({
  imports: [],
  controllers: [SolutionsController],
  providers: [SolutionsConfigService],
  exports: [SolutionsConfigService],
})
export class SolutionsModule {}
```

### 1.3 New Endpoints

**Public Endpoints:**

- `GET /solutions` - Returns all solution configurations
- `GET /solutions/:key` - Returns solution configuration by key (PRODUCTION, EVENTS, PHOTOGRAPHY)

**Note**: All endpoints are public (no authentication required) and return static configuration data.

---

## 2. Services Module Changes

### 2.1 Entity Changes

**File**: `src/modules/services/entities/service.entity.ts`

**Removed:**

```typescript
@ManyToMany(() => SolutionEntity, (solution) => solution.services)
@JoinTable({
  name: 'solution_services',
  joinColumn: { name: 'service_id', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'solution_id', referencedColumnName: 'id' },
})
solutions: SolutionEntity[];
```

**Added:**

```typescript
import { SolutionKey } from 'src/modules/solutions/solution-key.enum';

@Column({ type: 'enum', enum: SolutionKey, name: 'solution_key', nullable: true })
solutionKey: SolutionKey;
```

### 2.2 DTO Changes

#### CreateServiceDto

**File**: `src/modules/services/dtos/request/create-service.dto.ts`

**Removed:**

```typescript
solutionIds?: number[];
```

**Added:**

```typescript
import { SolutionKey } from 'src/modules/solutions/solution-key.enum';

@IsEnum(SolutionKey)
solutionKey: SolutionKey;
```

#### UpdateServiceDto

- Automatically inherits changes from `CreateServiceDto` via `PartialType`
- No direct changes needed

#### ServiceResponseDto

**File**: `src/modules/services/dtos/response/service-response.dto.ts`

**Removed:**

```typescript
import { SolutionResponseDto } from 'src/modules/solutions/dtos/response/solution-response.dto';

solutions?: SolutionResponseDto[];
```

**Added:**

```typescript
import { SolutionKey } from 'src/modules/solutions/solution-key.enum';

solutionKey: SolutionKey;
```

**Updated `fromEntity` method:**

```typescript
static fromEntity(entity: ServiceEntity): ServiceResponseDto {
  const dto = new ServiceResponseDto();
  // ... other mappings
  dto.solutionKey = entity.solutionKey;
  // Removed: dto.solutions = entity.solutions?.map(...)
  return dto;
}
```

#### ServiceFilterDto

**File**: `src/modules/services/dtos/query/service-filter.dto.ts`

**Removed:**

```typescript
solutionId?: number;
```

**Added:**

```typescript
import { SolutionKey } from 'src/modules/solutions/solution-key.enum';

@IsOptional()
@IsEnum(SolutionKey)
solutionKey?: SolutionKey;
```

#### PublicServiceFilterDto

- Inherits changes from `ServiceFilterDto` via extension
- No direct changes needed

### 2.3 Service Changes

#### ServicesService

**File**: `src/modules/services/services/services.service.ts`

**Changes:**

- Removed `['solutions']` from all `getById` calls
- Updated methods: `create`, `getById`, `findBySlug`, `update`, `publish`, `unpublish`, `toggleFeatured`

**Before:**

```typescript
return this.read.getById(saved.id, ['solutions']);
```

**After:**

```typescript
return this.read.getById(saved.id);
```

#### ServicesReadService

**File**: `src/modules/services/services/services-read.service.ts`

**Removed:**

- `qb.leftJoinAndSelect('service.solutions', 'solutions');` from `getPublished` and `findAll` methods

**Updated Filters:**

```typescript
// Removed
if (filter.solutionId !== undefined) {
  qb.andWhere('solutions.id = :solutionId', { solutionId: filter.solutionId });
}

// Added
if (filter.solutionKey !== undefined) {
  qb.andWhere('service.solutionKey = :solutionKey', { solutionKey: filter.solutionKey });
}
```

**Updated Pagination:**

- Set `shouldUseSafePagination` to `false` (no joins needed)

#### ServicesCrudService

**File**: `src/modules/services/services/services-crud.service.ts`

**Removed:**

- `import { SolutionEntity } from '../../solutions/entities/solution.entity';`
- `solutionIds` from `createEntityPayload` and `updateEntityPayload` destructuring
- `attachRelationsOnCreate` method (solutions relation handling)
- `syncRelationsOnUpdate` method (solutions relation handling)
- Junction table sync for `solution_services` in `delete` method:

```typescript
await this.junctionSync.sync(id, [], {
  table: 'solution_services',
  // ...
});
```

### 2.4 Module Changes

**File**: `src/modules/services/services.module.ts`

**Removed:**

```typescript
import { SolutionEntity } from '../solutions/entities/solution.entity';

TypeOrmModule.forFeature([ServiceEntity, SolutionEntity]);
```

**Updated:**

```typescript
TypeOrmModule.forFeature([ServiceEntity]);
```

---

## 3. Database Migration

### Migration File

`src/migrations/1767279124572-MigrateSolutionsToEnum.ts`

### Migration Steps

#### Up Migration:

1. **Create enum type**

```sql
CREATE TYPE solution_key_enum AS ENUM ('PRODUCTION', 'EVENTS', 'PHOTOGRAPHY');
```

2. **Add solution_key column to services table**

```sql
ALTER TABLE services
ADD COLUMN solution_key solution_key_enum;
```

3. **Migrate data from solution_services junction table**

```sql
UPDATE services s
SET solution_key = CASE
  WHEN EXISTS (
    SELECT 1 FROM solution_services ss
    INNER JOIN solutions sol ON ss.solution_id = sol.id
    WHERE ss.service_id = s.id
    AND LOWER(sol.slug) = 'production'
  ) THEN 'PRODUCTION'::solution_key_enum
  -- ... similar for EVENTS and PHOTOGRAPHY
END
WHERE EXISTS (
  SELECT 1 FROM solution_services ss WHERE ss.service_id = s.id
);
```

4. **Drop foreign key constraints**

```sql
-- Drop constraints from solution_projects if exists
ALTER TABLE solution_projects DROP CONSTRAINT IF EXISTS FK_solution_projects_solution_id;
```

5. **Drop junction tables**

```sql
DROP TABLE IF EXISTS solution_services CASCADE;
DROP TABLE IF EXISTS solution_projects CASCADE;
```

6. **Drop solutions table**

```sql
DROP TABLE IF EXISTS solutions CASCADE;
```

#### Down Migration:

- Recreates all tables and relationships
- Restores original structure

---

## 4. Facilities/Projects Module Updates

### 4.1 Facilities Module (Later Renamed to Broadcast)

**Entity Changes:**

- Removed `solutionId` and `solution` relationship
- Added `solutionKey: SolutionKey` enum column

**DTO Changes:**

- `CreateFacilityDto`: Changed `solutionId` to `solutionKey`
- `FacilityFilterDto`: Changed `solutionId` to `solutionKey`
- `PublicFacilityFilterDto`: Removed `solutionId` and `solutionSlug`, added `solutionKey`
- `FacilityResponseDto`: Changed `solutionId` to `solutionKey`

**Service Changes:**

- Updated filters to use `solutionKey` instead of `solutionId`
- Removed join for `facility.solution`

### 4.2 Projects Module

**Entity Changes:**

- Removed `@ManyToMany` relationship with `SolutionEntity`
- Removed `@JoinTable` for `project_solutions`

**DTO Changes:**

- `CreateProjectDto`: Removed `solutionIds`
- `ProjectFilterDto`: Removed `solutionId`
- `ProjectResponseDto`: Removed `solutions` array

**Service Changes:**

- Removed solution-related joins and filters
- Removed solution association logic from CRUD operations

---

## 5. Postman Collections

### Created Collections:

1. **Broadcast-API.postman_collection.json**
   - Updated from Facilities API
   - Removed all `solutionId`/`solutionKey` references
   - Updated endpoints from `/facilities` to `/broadcasts`

2. **Services-API.postman_collection.json**
   - New collection for Services API
   - Uses `solutionKey` enum instead of `solutionIds`
   - Includes all CRUD operations

3. **Solutions-API.postman_collection.json**
   - New collection for Solutions API
   - Simple read-only endpoints
   - `GET /solutions` and `GET /solutions/:key`

---

## 6. Seed Scripts Updates

### Updated Files:

1. **services.ts**
   - Changed `solutionIds?: number[]` to `solutionKey?: SolutionKey`
   - Updated DTO creation to use `solutionKey`

2. **broadcasts.ts** (renamed from facilities.ts)
   - Removed `solutionId` from interface
   - Updated to use BroadcastService instead of FacilitiesService
   - Updated JSON file path to `broadcasts.json`

3. **broadcast-units.ts** (renamed from facility-units.ts)
   - Changed `facilityId` to `broadcastId`
   - Updated all references to use Broadcast naming

---

## 7. Benefits of This Refactoring

### Advantages:

1. **Simplified Architecture**
   - Solutions are now static configuration, reducing database complexity
   - No need for CRUD operations on Solutions
   - Eliminated junction tables

2. **Better Performance**
   - No joins needed when querying Services
   - Simpler queries and faster execution
   - Reduced database overhead

3. **Type Safety**
   - Enum-based solution keys provide compile-time type checking
   - Prevents invalid solution references

4. **Easier Maintenance**
   - Solution configuration is code-based, easier to version control
   - No database migrations needed for solution changes
   - Clearer separation of concerns

5. **Reduced Complexity**
   - Services now have a single solution reference instead of many-to-many
   - Simpler data model
   - Easier to understand and maintain

---

## 8. Breaking Changes

### API Changes:

1. **Services API**
   - `POST /admin/services`: Changed `solutionIds` to `solutionKey`
   - `PATCH /admin/services/:id`: Changed `solutionIds` to `solutionKey`
   - `GET /admin/services`: Filter changed from `solutionId` to `solutionKey`
   - `GET /services/published`: Filter changed from `solutionId` to `solutionKey`
   - Response changed from `solutions[]` to `solutionKey`

2. **Solutions API**
   - All CRUD endpoints removed
   - Only read-only config endpoints remain
   - Response structure changed to config format

3. **Facilities/Broadcasts API**
   - Removed `solutionId` from all endpoints
   - Removed `solutionSlug` filter from public endpoints

### Database Changes:

1. **Tables Dropped:**
   - `solutions` table
   - `solution_services` junction table
   - `solution_projects` junction table

2. **Columns Added:**
   - `services.solution_key` (enum)
   - `facilities.solution_key` (enum, later removed when renamed to broadcasts)

3. **Columns Removed:**
   - `facilities.solution_id` (foreign key)

---

## 9. Migration Guide

### For Frontend Developers:

1. **Update Service Creation/Update**

   ```typescript
   // Before
   {
     solutionIds: [1, 2];
   }

   // After
   {
     solutionKey: 'PRODUCTION';
   }
   ```

2. **Update Service Filters**

   ```typescript
   // Before
   ?solutionId=1

   // After
   ?solutionKey=PRODUCTION
   ```

3. **Update Service Response Handling**

   ```typescript
   // Before
   service.solutions.forEach(solution => { ... })

   // After
   const solutionConfig = getSolutionConfig(service.solutionKey)
   ```

4. **Update Solutions Endpoints**

   ```typescript
   // Before
   GET /solutions/published
   GET /solutions/slug/:slug

   // After
   GET /solutions
   GET /solutions/:key  // key: PRODUCTION, EVENTS, PHOTOGRAPHY
   ```

### For Backend Developers:

1. **When Creating Services**
   - Use `solutionKey` enum value instead of `solutionIds` array
   - Ensure the enum value matches one of: `PRODUCTION`, `EVENTS`, `PHOTOGRAPHY`

2. **When Querying Services**
   - Filter by `solutionKey` instead of joining with solutions table
   - Use enum values in filters

3. **When Working with Solutions**
   - Solutions are now static config, accessed via `SolutionsConfigService`
   - No database operations needed
   - Configuration is in `solutions.config.ts`

---

## 10. Testing Checklist

### Services Module:

- [ ] Create service with `solutionKey`
- [ ] Update service `solutionKey`
- [ ] Filter services by `solutionKey`
- [ ] Verify `solutionKey` in response
- [ ] Test all CRUD operations

### Solutions Module:

- [ ] Get all solutions config
- [ ] Get solution config by key
- [ ] Verify config structure
- [ ] Test invalid key handling

### Database:

- [ ] Verify migration runs successfully
- [ ] Verify data migration from junction table
- [ ] Verify old tables are dropped
- [ ] Test rollback migration

---

## 11. Files Changed Summary

### Created:

- `src/modules/solutions/solution-key.enum.ts`
- `src/modules/solutions/solutions.config.ts`
- `src/modules/solutions/services/solutions-config.service.ts`
- `src/modules/solutions/dtos/response/solution-config-response.dto.ts`
- `src/migrations/1767279124572-MigrateSolutionsToEnum.ts`
- `postman/Services-API.postman_collection.json`
- `postman/Solutions-API.postman_collection.json`

### Modified:

- `src/modules/services/entities/service.entity.ts`
- `src/modules/services/dtos/request/create-service.dto.ts`
- `src/modules/services/dtos/query/service-filter.dto.ts`
- `src/modules/services/dtos/response/service-response.dto.ts`
- `src/modules/services/services/services.service.ts`
- `src/modules/services/services/services-read.service.ts`
- `src/modules/services/services/services-crud.service.ts`
- `src/modules/services/services.module.ts`
- `src/modules/solutions/controllers/solutions.controller.ts`
- `src/modules/solutions/solutions.module.ts`
- `src/scripts/seeds/services.ts`

### Deleted:

- `src/modules/solutions/entities/solution.entity.ts`
- All Solutions CRUD DTOs
- Solutions CRUD services

---

## 12. Future Considerations

1. **Adding New Solutions**
   - Update `SolutionKey` enum
   - Add configuration to `SOLUTIONS_CONFIG` array
   - No database migration needed

2. **Solution Configuration Changes**
   - Update `solutions.config.ts` file
   - Changes take effect immediately (no deployment needed for config-only changes)

3. **Service-Solution Relationship**
   - If many-to-many is needed again, consider using a JSON array of enum values
   - Or create a separate mapping table if complex relationships are required

---

## Conclusion

This refactoring successfully converted Solutions from a dynamic database entity to a static enum-based configuration, simplifying the architecture while maintaining functionality. Services now reference solutions via a simple enum field, eliminating the need for junction tables and complex relationships.

The changes improve performance, maintainability, and type safety while reducing overall system complexity.
