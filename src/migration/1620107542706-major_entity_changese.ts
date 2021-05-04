import {MigrationInterface, QueryRunner} from "typeorm";

export class majorEntityChangese1620107542706 implements MigrationInterface {
    name = 'majorEntityChangese1620107542706'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plans" DROP CONSTRAINT "FK_dd77a65c3fe0c09e54fc156b14b"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP CONSTRAINT "FK_eb6c00d59daf65d0bef9df3f823"`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" DROP CONSTRAINT "FK_8ed56ad1ba2bd0dacfd6ba93166"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`);
        await queryRunner.query(`DROP INDEX "IDX_eb6c00d59daf65d0bef9df3f82"`);
        await queryRunner.query(`DROP INDEX "IDX_8ed56ad1ba2bd0dacfd6ba9316"`);
        await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
        await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "stripeId"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "stripeSubscriptionItem"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "planType"`);
        await queryRunner.query(`DROP TYPE "public"."plans_plantype_enum"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "smsCount"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "productId"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "recurring"`);
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
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "rId" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "country" ADD "smsCost" numeric`);
        await queryRunner.query(`ALTER TABLE "country" ADD "phoneCost" numeric`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD "meta" json`);
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
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`);
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
        await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "meta"`);
        await queryRunner.query(`ALTER TABLE "country" DROP COLUMN "phoneCost"`);
        await queryRunner.query(`ALTER TABLE "country" DROP COLUMN "smsCost"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "rId"`);
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
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "recurring" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "productId" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "smsCount" integer DEFAULT '0'`);
        await queryRunner.query(`CREATE TYPE "public"."plans_plantype_enum" AS ENUM('bundle', 'phoneOnly', 'smsOnly')`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "planType" "plans_plantype_enum" NOT NULL DEFAULT 'bundle'`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "stripeSubscriptionItem" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "stripeId" character varying(100) NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8ed56ad1ba2bd0dacfd6ba9316" ON "influencer_contacts" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_eb6c00d59daf65d0bef9df3f82" ON "influencer_contacts" ("contactId") `);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD CONSTRAINT "FK_8ed56ad1ba2bd0dacfd6ba93166" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "influencer_contacts" ADD CONSTRAINT "FK_eb6c00d59daf65d0bef9df3f823" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plans" ADD CONSTRAINT "FK_dd77a65c3fe0c09e54fc156b14b" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
