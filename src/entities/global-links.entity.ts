import { TABLES } from 'src/consts/tables.const';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: TABLES.GLOBAL_LINKS.name })
export class GlobalLinksEntity {
  @PrimaryColumn({ unique: true, nullable: false })
  shareableId: string;

  @Column({ length: 255, nullable: false })
  link: string;
}
