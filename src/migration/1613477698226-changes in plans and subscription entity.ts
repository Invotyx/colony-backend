import { MigrationInterface, QueryRunner } from 'typeorm';

export class changesInPlansAndSubscriptionEntity1613477698226
  implements MigrationInterface {
  name = 'changesInPlansAndSubscriptionEntity1613477698226';

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
      `ALTER TABLE "subscriptions" ADD "stripeId" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "UQ_a9b6c84b1e151e4fbc412d66cdd" UNIQUE ("stripeId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "PK_a87248d73155605cf782be9ee5e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "UQ_a87248d73155605cf782be9ee5e"`,
    );
    await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD "id" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id")`,
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
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "PK_a87248d73155605cf782be9ee5e"`,
    );
    await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD "id" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "UQ_a87248d73155605cf782be9ee5e" UNIQUE ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "UQ_a9b6c84b1e151e4fbc412d66cdd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP COLUMN "stripeId"`,
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
