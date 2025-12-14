import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

export type JunctionSpec = {
  table: string;
  leftKey: string; // e.g. project_id
  rightKey: string; // e.g. service_id
};

@Injectable()
export class JunctionSyncService {
  constructor(private readonly dataSource: DataSource) {}

  async sync(
    leftId: number | string,
    rightIds: Array<number | string>,
    spec: JunctionSpec,
    manager?: EntityManager,
  ): Promise<void> {
    const em = manager ?? this.dataSource.manager;

    // wipe old
    await em.query(`DELETE FROM ${spec.table} WHERE ${spec.leftKey} = $1`, [leftId]);

    if (!rightIds?.length) return;

    // insert new (batch)
    const valuesSql = rightIds.map((_, i) => `($1, $${i + 2})`).join(', ');
    await em.query(`INSERT INTO ${spec.table} (${spec.leftKey}, ${spec.rightKey}) VALUES ${valuesSql}`, [
      leftId,
      ...rightIds,
    ]);
  }
}
