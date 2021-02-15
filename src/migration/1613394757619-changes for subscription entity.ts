import { MigrationInterface, QueryRunner } from 'typeorm';

export class changesForSubscriptionEntity1613394757619
  implements MigrationInterface {
  name = 'changesForSubscriptionEntity1613394757619';

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
      `ALTER TYPE "public"."subscriptions_collection_method_enum" RENAME TO "subscriptions_collection_method_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "subscriptions_collection_method_enum" AS ENUM('charge_automatically', 'send_invoice')`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ALTER COLUMN "collection_method" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ALTER COLUMN "collection_method" TYPE "subscriptions_collection_method_enum" USING "collection_method"::"text"::"subscriptions_collection_method_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ALTER COLUMN "collection_method" SET DEFAULT 'charge_automatically'`,
    );
    await queryRunner.query(
      `DROP TYPE "subscriptions_collection_method_enum_old"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "subscriptions"."collection_method" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ALTER COLUMN "collection_method" SET DEFAULT 'charge_automatically'`,
    );
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
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ALTER COLUMN "collection_method" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "subscriptions"."collection_method" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "subscriptions_collection_method_enum_old" AS ENUM('0', '1')`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ALTER COLUMN "collection_method" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ALTER COLUMN "collection_method" TYPE "subscriptions_collection_method_enum_old" USING "collection_method"::"text"::"subscriptions_collection_method_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ALTER COLUMN "collection_method" SET DEFAULT 'charge_automatically'`,
    );
    await queryRunner.query(`DROP TYPE "subscriptions_collection_method_enum"`);
    await queryRunner.query(
      `ALTER TYPE "subscriptions_collection_method_enum_old" RENAME TO  "subscriptions_collection_method_enum"`,
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
