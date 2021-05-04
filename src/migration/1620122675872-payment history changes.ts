import {MigrationInterface, QueryRunner} from "typeorm";

export class paymentHistoryChanges1620122675872 implements MigrationInterface {
    name = 'paymentHistoryChanges1620122675872'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP CONSTRAINT "FK_eb6c00d59daf65d0bef9df3f823"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP CONSTRAINT "FK_8ed56ad1ba2bd0dacfd6ba93166"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`);
        await queryRunner.query(`DROP INDEX "IDX_eb6c00d59daf65d0bef9df3f82"`);
        await queryRunner.query(`DROP INDEX "IDX_8ed56ad1ba2bd0dacfd6ba9316"`);
        await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
        await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
        await queryRunner.query(`CREATE TABLE "payment_history" ("id" SERIAL NOT NULL, "smsCost" numeric NOT NULL DEFAULT '0', "phoneCost" numeric NOT NULL DEFAULT '0', "subscriberCost" numeric NOT NULL DEFAULT '0', "packageCost" numeric NOT NULL DEFAULT '0', "thresholdSmsCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer NOT NULL, CONSTRAINT "PK_5fcec51a769b65c0c3c0987f11c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "meta"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP CONSTRAINT "PK_45170f07127ff6f89c97d2d64b2"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD CONSTRAINT "PK_3a91f61fd35430b525cea602d3c" PRIMARY KEY ("userId", "contactId", "id")`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD "meta" json`);
        await queryRunner.query(`ALTER TABLE "users" ADD "consumedSmsCost" numeric NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "consumedSubscriberCost" numeric NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP CONSTRAINT "PK_3a91f61fd35430b525cea602d3c"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD CONSTRAINT "PK_45170f07127ff6f89c97d2d64b2" PRIMARY KEY ("contactId", "userId")`);
        await queryRunner.query(`COMMENT ON COLUMN "phones"."sid" IS NULL`);
        await queryRunner.query(`ALTER TABLE "phones" ALTER COLUMN "sid" SET DEFAULT null`);
        await queryRunner.query(`COMMENT ON COLUMN "conversation_messages"."receivedAt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "conversation_messages" ALTER COLUMN "receivedAt" SET DEFAULT null`);
        await queryRunner.query(`CREATE INDEX "IDX_eb6c00d59daf65d0bef9df3f82" ON "influencer_contacts" ("contactId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8ed56ad1ba2bd0dacfd6ba9316" ON "influencer_contacts" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD CONSTRAINT "FK_8ed56ad1ba2bd0dacfd6ba93166" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD CONSTRAINT "FK_eb6c00d59daf65d0bef9df3f823" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_history" ADD CONSTRAINT "FK_34d643de1a588d2350297da5c24" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`);
        await queryRunner.query(`ALTER TABLE "payment_history" DROP CONSTRAINT "FK_34d643de1a588d2350297da5c24"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP CONSTRAINT "FK_eb6c00d59daf65d0bef9df3f823"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP CONSTRAINT "FK_8ed56ad1ba2bd0dacfd6ba93166"`);
        await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
        await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
        await queryRunner.query(`DROP INDEX "IDX_8ed56ad1ba2bd0dacfd6ba9316"`);
        await queryRunner.query(`DROP INDEX "IDX_eb6c00d59daf65d0bef9df3f82"`);
        await queryRunner.query(`ALTER TABLE "conversation_messages" ALTER COLUMN "receivedAt" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "conversation_messages"."receivedAt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "phones" ALTER COLUMN "sid" SET DEFAULT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "phones"."sid" IS NULL`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP CONSTRAINT "PK_45170f07127ff6f89c97d2d64b2"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD CONSTRAINT "PK_3a91f61fd35430b525cea602d3c" PRIMARY KEY ("userId", "contactId", "id")`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "consumedSubscriberCost"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "consumedSmsCost"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "meta"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP CONSTRAINT "PK_3a91f61fd35430b525cea602d3c"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD CONSTRAINT "PK_45170f07127ff6f89c97d2d64b2" PRIMARY KEY ("userId", "contactId")`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD "meta" json`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD "id" integer NOT NULL DEFAULT nextval('148250'`);
        await queryRunner.query(`DROP TABLE "payment_history"`);
        await queryRunner.query(`CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8ed56ad1ba2bd0dacfd6ba9316" ON "influencer_contacts" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_eb6c00d59daf65d0bef9df3f82" ON "influencer_contacts" ("contactId") `);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD CONSTRAINT "FK_8ed56ad1ba2bd0dacfd6ba93166" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD CONSTRAINT "FK_eb6c00d59daf65d0bef9df3f823" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
