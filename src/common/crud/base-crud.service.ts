import { Repository, DataSource, EntityManager, DeepPartial } from 'typeorm';
import { SlugUniquenessService } from '../db/slug-uniqueness.service';
import { FlagsService } from '../db/flags.service';
import { findByIdOrThrow } from '../db/find-or-throw';

export abstract class BaseCrudService<Entity extends { id: any; slug: string }, CreateDto, UpdateDto> {
  protected constructor(
    protected readonly repo: Repository<Entity>,
    protected readonly dataSource: DataSource,
    protected readonly slugGuard: SlugUniquenessService,
    protected readonly flags: FlagsService,
  ) {}

  protected notFoundMessage(): string {
    return 'Resource not found';
  }

  // Hooks
  protected abstract createEntityPayload(dto: CreateDto): Partial<Entity>;
  protected abstract updateEntityPayload(entity: Entity, dto: UpdateDto): void;

  protected async attachRelationsOnCreate(_entity: Entity, _dto: CreateDto, _em: EntityManager): Promise<void> {}
  protected async syncRelationsOnUpdate(_entity: Entity, _dto: UpdateDto, _em: EntityManager): Promise<void> {}

  async create(dto: CreateDto): Promise<Entity> {
    const slug = (dto as any).slug as string;
    await this.slugGuard.assertUnique(this.repo as any, slug);

    return this.dataSource.transaction(async (em) => {
      const repo = em.getRepository(this.repo.target as any) as Repository<Entity>;
      const payload = this.createEntityPayload(dto) as DeepPartial<Entity>;
      const entity = repo.create(payload) as Entity;
      const saved = (await repo.save(entity)) as Entity;

      await this.attachRelationsOnCreate(saved, dto, em);
      return saved;
    });
  }

  async update(id: Entity['id'], dto: UpdateDto): Promise<Entity> {
    const entity = await findByIdOrThrow(this.repo, id, { message: this.notFoundMessage() });

    const newSlug = (dto as any).slug as string | undefined;
    if (newSlug && newSlug !== entity.slug) {
      await this.slugGuard.assertUnique(this.repo as any, newSlug, { excludeId: id });
    }

    return this.dataSource.transaction(async (em) => {
      const repo = em.getRepository(this.repo.target as any) as Repository<Entity>;
      const managed = await repo.findOne({
        where: { id } as any,
      });
      if (!managed) throw new Error(this.notFoundMessage());

      this.updateEntityPayload(managed, dto);
      const saved = (await repo.save(managed)) as Entity;

      await this.syncRelationsOnUpdate(saved, dto, em);
      return saved;
    });
  }

  async delete(id: Entity['id']): Promise<void> {
    await findByIdOrThrow(this.repo, id, { message: this.notFoundMessage() });
    await this.repo.delete(id as any);
  }

  async publish(id: Entity['id']): Promise<Entity> {
    return this.flags.setFlag(this.repo as any, id, 'isPublished' as any, true, this.notFoundMessage());
  }

  async unpublish(id: Entity['id']): Promise<Entity> {
    return this.flags.setFlag(this.repo as any, id, 'isPublished' as any, false, this.notFoundMessage());
  }

  async toggleFeatured(id: Entity['id']): Promise<Entity> {
    return this.flags.toggleFlag(this.repo as any, id, 'isFeatured' as any, this.notFoundMessage());
  }
}
