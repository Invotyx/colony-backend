import { MigrationInterface, QueryRunner } from 'typeorm';

export class changesInPlansEntity1613467119266 implements MigrationInterface {
  name = 'changesInPlansEntity1613467119266';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
    await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
    await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "meta"`);
    await queryRunner.query(`ALTER TABLE "user_role" ADD "meta" json`);
    await queryRunner.query(
      `ALTER TYPE "public"."plans_plantype_enum" RENAME TO "plans_plantype_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "plans_plantype_enum" AS ENUM('bundle', 'phoneOnly', 'smsOnly')`,
    );
    await queryRunner.query(
      `ALTER TABLE "plans" ALTER COLUMN "planType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "plans" ALTER COLUMN "planType" TYPE "plans_plantype_enum" USING "planType"::"text"::"plans_plantype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plans" ALTER COLUMN "planType" SET DEFAULT 'bundle'`,
    );
    await queryRunner.query(`DROP TYPE "plans_plantype_enum_old"`);
    await queryRunner.query(`COMMENT ON COLUMN "plans"."planType" IS NULL`);
    await queryRunner.query(
      `CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `,
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
    await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
    await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
    await queryRunner.query(`COMMENT ON COLUMN "plans"."planType" IS NULL`);
    await queryRunner.query(
      `CREATE TYPE "plans_plantype_enum_old" AS ENUM('bundle', 'phoneOnly')`,
    );
    await queryRunner.query(
      `ALTER TABLE "plans" ALTER COLUMN "planType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "plans" ALTER COLUMN "planType" TYPE "plans_plantype_enum_old" USING "planType"::"text"::"plans_plantype_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plans" ALTER COLUMN "planType" SET DEFAULT 'bundle'`,
    );
    await queryRunner.query(`DROP TYPE "plans_plantype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "plans_plantype_enum_old" RENAME TO  "plans_plantype_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "meta"`);
    await queryRunner.query(`ALTER TABLE "user_role" ADD "meta" json`);
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
