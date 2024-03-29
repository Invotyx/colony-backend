import {MigrationInterface, QueryRunner} from "typeorm";

export class MetaFieldAddedToHistory1624001808374 implements MigrationInterface {
    name = 'MetaFieldAddedToHistory1624001808374'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" DROP CONSTRAINT "FK_c39aaaf8c4d0008481197a31d31"`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" DROP CONSTRAINT "FK_9790665a8b08380db487e54b1be"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP CONSTRAINT "FK_eb6c00d59daf65d0bef9df3f823"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP CONSTRAINT "FK_8ed56ad1ba2bd0dacfd6ba93166"`);
        await queryRunner.query(`DROP INDEX "IDX_9790665a8b08380db487e54b1b"`);
        await queryRunner.query(`DROP INDEX "IDX_c39aaaf8c4d0008481197a31d3"`);
        await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
        await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
        await queryRunner.query(`DROP INDEX "IDX_eb6c00d59daf65d0bef9df3f82"`);
        await queryRunner.query(`DROP INDEX "IDX_8ed56ad1ba2bd0dacfd6ba9316"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "meta"`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" DROP CONSTRAINT "PK_05a33299d7fc459c795cf6936f5"`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" ADD CONSTRAINT "PK_10b686fa25f68cbdcb4f2509a0e" PRIMARY KEY ("userId", "contactId", "id")`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "payment_history" ADD "meta" text`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD "meta" json`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP CONSTRAINT "PK_45170f07127ff6f89c97d2d64b2"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD CONSTRAINT "PK_3a91f61fd35430b525cea602d3c" PRIMARY KEY ("userId", "contactId", "id")`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" DROP CONSTRAINT "PK_10b686fa25f68cbdcb4f2509a0e"`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" ADD CONSTRAINT "PK_05a33299d7fc459c795cf6936f5" PRIMARY KEY ("userId", "contactId")`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP CONSTRAINT "PK_3a91f61fd35430b525cea602d3c"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD CONSTRAINT "PK_45170f07127ff6f89c97d2d64b2" PRIMARY KEY ("contactId", "userId")`);
        await queryRunner.query(`COMMENT ON COLUMN "conversation_messages"."receivedAt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "conversation_messages" ALTER COLUMN "receivedAt" SET DEFAULT null`);
        await queryRunner.query(`COMMENT ON COLUMN "phones"."sid" IS NULL`);
        await queryRunner.query(`ALTER TABLE "phones" ALTER COLUMN "sid" SET DEFAULT null`);
        await queryRunner.query(`CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_9790665a8b08380db487e54b1b" ON "favorite_contacts" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c39aaaf8c4d0008481197a31d3" ON "favorite_contacts" ("contactId") `);
        await queryRunner.query(`CREATE INDEX "IDX_eb6c00d59daf65d0bef9df3f82" ON "influencer_contacts" ("contactId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8ed56ad1ba2bd0dacfd6ba9316" ON "influencer_contacts" ("userId") `);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" ADD CONSTRAINT "FK_9790665a8b08380db487e54b1be" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" ADD CONSTRAINT "FK_c39aaaf8c4d0008481197a31d31" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD CONSTRAINT "FK_8ed56ad1ba2bd0dacfd6ba93166" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD CONSTRAINT "FK_eb6c00d59daf65d0bef9df3f823" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP CONSTRAINT "FK_eb6c00d59daf65d0bef9df3f823"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP CONSTRAINT "FK_8ed56ad1ba2bd0dacfd6ba93166"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" DROP CONSTRAINT "FK_c39aaaf8c4d0008481197a31d31"`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" DROP CONSTRAINT "FK_9790665a8b08380db487e54b1be"`);
        await queryRunner.query(`DROP INDEX "IDX_8ed56ad1ba2bd0dacfd6ba9316"`);
        await queryRunner.query(`DROP INDEX "IDX_eb6c00d59daf65d0bef9df3f82"`);
        await queryRunner.query(`DROP INDEX "IDX_c39aaaf8c4d0008481197a31d3"`);
        await queryRunner.query(`DROP INDEX "IDX_9790665a8b08380db487e54b1b"`);
        await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
        await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
        await queryRunner.query(`ALTER TABLE "phones" ALTER COLUMN "sid" SET DEFAULT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "phones"."sid" IS NULL`);
        await queryRunner.query(`ALTER TABLE "conversation_messages" ALTER COLUMN "receivedAt" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "conversation_messages"."receivedAt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP CONSTRAINT "PK_45170f07127ff6f89c97d2d64b2"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD CONSTRAINT "PK_3a91f61fd35430b525cea602d3c" PRIMARY KEY ("userId", "contactId", "id")`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" DROP CONSTRAINT "PK_05a33299d7fc459c795cf6936f5"`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" ADD CONSTRAINT "PK_10b686fa25f68cbdcb4f2509a0e" PRIMARY KEY ("userId", "contactId", "id")`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP CONSTRAINT "PK_3a91f61fd35430b525cea602d3c"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD CONSTRAINT "PK_45170f07127ff6f89c97d2d64b2" PRIMARY KEY ("userId", "contactId")`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "meta"`);
        await queryRunner.query(`ALTER TABLE "payment_history" DROP COLUMN "meta"`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" DROP CONSTRAINT "PK_10b686fa25f68cbdcb4f2509a0e"`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" ADD CONSTRAINT "PK_05a33299d7fc459c795cf6936f5" PRIMARY KEY ("userId", "contactId")`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD "meta" json`);
        await queryRunner.query(`CREATE INDEX "IDX_8ed56ad1ba2bd0dacfd6ba9316" ON "influencer_contacts" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_eb6c00d59daf65d0bef9df3f82" ON "influencer_contacts" ("contactId") `);
        await queryRunner.query(`CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c39aaaf8c4d0008481197a31d3" ON "favorite_contacts" ("contactId") `);
        await queryRunner.query(`CREATE INDEX "IDX_9790665a8b08380db487e54b1b" ON "favorite_contacts" ("userId") `);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD CONSTRAINT "FK_8ed56ad1ba2bd0dacfd6ba93166" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD CONSTRAINT "FK_eb6c00d59daf65d0bef9df3f823" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" ADD CONSTRAINT "FK_9790665a8b08380db487e54b1be" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorite_contacts" ADD CONSTRAINT "FK_c39aaaf8c4d0008481197a31d31" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
