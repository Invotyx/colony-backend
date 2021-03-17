import { MigrationInterface, QueryRunner } from 'typeorm';

export class broadcostAddedToPivotTable1615545460665
  implements MigrationInterface {
  name = 'broadcostAddedToPivotTable1615545460665';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" DROP CONSTRAINT "FK_eb6c00d59daf65d0bef9df3f823"`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" DROP CONSTRAINT "FK_8ed56ad1ba2bd0dacfd6ba93166"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_eb6c00d59daf65d0bef9df3f82"`);
    await queryRunner.query(`DROP INDEX "IDX_8ed56ad1ba2bd0dacfd6ba9316"`);
    await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
    await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
    await queryRunner.query(
      `CREATE TABLE "broadcasts" ("id" SERIAL NOT NULL, "name" character varying(200) NOT NULL, "body" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer, CONSTRAINT "PK_b0586900034d0726bbdcb1b21b2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "broadcasts_contacts" ("id" SERIAL NOT NULL, "isSent" boolean NOT NULL, "status" character varying(20) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "broadcastId" integer, CONSTRAINT "PK_991d00608a07f47fbc9675b1b09" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "meta"`);
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" ADD "id" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" DROP CONSTRAINT "PK_45170f07127ff6f89c97d2d64b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" ADD CONSTRAINT "PK_3a91f61fd35430b525cea602d3c" PRIMARY KEY ("userId", "contactId", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" ADD "deletedAt" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "user_role" ADD "meta" json`);
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" DROP CONSTRAINT "PK_3a91f61fd35430b525cea602d3c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" ADD CONSTRAINT "PK_45170f07127ff6f89c97d2d64b2" PRIMARY KEY ("contactId", "userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eb6c00d59daf65d0bef9df3f82" ON "influencer_contacts" ("contactId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8ed56ad1ba2bd0dacfd6ba9316" ON "influencer_contacts" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" ADD CONSTRAINT "FK_8ed56ad1ba2bd0dacfd6ba93166" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" ADD CONSTRAINT "FK_eb6c00d59daf65d0bef9df3f823" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "broadcasts" ADD CONSTRAINT "FK_73a8489561d16a4ff153f43c0c4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "broadcasts_contacts" ADD CONSTRAINT "FK_8da4b0c5939e7c26f5f52f680b2" FOREIGN KEY ("broadcastId") REFERENCES "broadcasts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "broadcasts_contacts" DROP CONSTRAINT "FK_8da4b0c5939e7c26f5f52f680b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "broadcasts" DROP CONSTRAINT "FK_73a8489561d16a4ff153f43c0c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" DROP CONSTRAINT "FK_eb6c00d59daf65d0bef9df3f823"`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" DROP CONSTRAINT "FK_8ed56ad1ba2bd0dacfd6ba93166"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
    await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
    await queryRunner.query(`DROP INDEX "IDX_8ed56ad1ba2bd0dacfd6ba9316"`);
    await queryRunner.query(`DROP INDEX "IDX_eb6c00d59daf65d0bef9df3f82"`);
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" DROP CONSTRAINT "PK_45170f07127ff6f89c97d2d64b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" ADD CONSTRAINT "PK_3a91f61fd35430b525cea602d3c" PRIMARY KEY ("userId", "contactId", "id")`,
    );
    await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "meta"`);
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" DROP CONSTRAINT "PK_3a91f61fd35430b525cea602d3c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" ADD CONSTRAINT "PK_45170f07127ff6f89c97d2d64b2" PRIMARY KEY ("userId", "contactId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" DROP COLUMN "id"`,
    );
    await queryRunner.query(`ALTER TABLE "user_role" ADD "meta" json`);
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" ADD "deletedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" ADD "id" SERIAL NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "broadcasts_contacts"`);
    await queryRunner.query(`DROP TABLE "broadcasts"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8ed56ad1ba2bd0dacfd6ba9316" ON "influencer_contacts" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eb6c00d59daf65d0bef9df3f82" ON "influencer_contacts" ("contactId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" ADD CONSTRAINT "FK_8ed56ad1ba2bd0dacfd6ba93166" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" ADD CONSTRAINT "FK_eb6c00d59daf65d0bef9df3f823" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
