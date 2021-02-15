import { MigrationInterface, QueryRunner } from 'typeorm';

export class buttonsAndOtherContentFixes1612769414548
  implements MigrationInterface {
  name = 'buttonsAndOtherContentFixes1612769414548';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
    await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
    await queryRunner.query(
      `CREATE TABLE "buttons" ("id" SERIAL NOT NULL, "text" character varying(60) NOT NULL, "link" character varying(300), "type" character varying(60) NOT NULL, "sectionsId" integer, CONSTRAINT "UQ_550734c6e2d28134ed88a4f793c" UNIQUE ("type"), CONSTRAINT "PK_0b55de60f80b00823be7aff0de2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "sections" DROP COLUMN "primaryButton"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sections" DROP COLUMN "secondaryButton"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sections" DROP COLUMN "imagePosition"`,
    );
    await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "meta"`);
    await queryRunner.query(
      `ALTER TABLE "images" ADD "imagePosition" character varying(10) DEFAULT 'center'`,
    );
    await queryRunner.query(
      `ALTER TABLE "sections" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(`ALTER TABLE "user_role" ADD "meta" json`);
    await queryRunner.query(
      `ALTER TYPE "public"."sections_sectiontype_enum" RENAME TO "sections_sectiontype_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "sections_sectiontype_enum" AS ENUM('regular', 'faqs', 'packages', 'featuredIn', 'banner')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sections" ALTER COLUMN "sectionType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sections" ALTER COLUMN "sectionType" TYPE "sections_sectiontype_enum" USING "sectionType"::"text"::"sections_sectiontype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sections" ALTER COLUMN "sectionType" SET DEFAULT 'regular'`,
    );
    await queryRunner.query(`DROP TYPE "sections_sectiontype_enum_old"`);
    await queryRunner.query(
      `COMMENT ON COLUMN "sections"."sectionType" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "buttons" ADD CONSTRAINT "FK_a4467ac1c7ead195e00ddbc522c" FOREIGN KEY ("sectionsId") REFERENCES "sections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "buttons" DROP CONSTRAINT "FK_a4467ac1c7ead195e00ddbc522c"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
    await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
    await queryRunner.query(
      `COMMENT ON COLUMN "sections"."sectionType" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "sections_sectiontype_enum_old" AS ENUM('regular', 'faqs', 'packages', 'featuredIn', 'clients')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sections" ALTER COLUMN "sectionType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sections" ALTER COLUMN "sectionType" TYPE "sections_sectiontype_enum_old" USING "sectionType"::"text"::"sections_sectiontype_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sections" ALTER COLUMN "sectionType" SET DEFAULT 'regular'`,
    );
    await queryRunner.query(`DROP TYPE "sections_sectiontype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "sections_sectiontype_enum_old" RENAME TO  "sections_sectiontype_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "meta"`);
    await queryRunner.query(`ALTER TABLE "sections" DROP COLUMN "isActive"`);
    await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "imagePosition"`);
    await queryRunner.query(`ALTER TABLE "user_role" ADD "meta" json`);
    await queryRunner.query(
      `ALTER TABLE "sections" ADD "imagePosition" character varying(10)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sections" ADD "secondaryButton" character varying(250)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sections" ADD "primaryButton" character varying(250)`,
    );
    await queryRunner.query(`DROP TABLE "buttons"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
