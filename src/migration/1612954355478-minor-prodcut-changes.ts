import {MigrationInterface, QueryRunner} from "typeorm";

export class minorProdcutChanges1612954355478 implements MigrationInterface {
    name = 'minorProdcutChanges1612954355478'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sections" DROP CONSTRAINT "FK_67aad1a5683fb3e96f4d0fd778b"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`);
        await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
        await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
        await queryRunner.query(`ALTER TABLE "sections" RENAME COLUMN "pagesId" TO "pageId"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "meta"`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD "meta" json`);
        await queryRunner.query(`ALTER TABLE "products" ADD "type" character varying(10) NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "payment_methods"."id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "payment_methods" ADD CONSTRAINT "UQ_34f9b8c6dfb4ac3559f7e2820d1" UNIQUE ("id")`);
        await queryRunner.query(`ALTER TABLE "plans" DROP CONSTRAINT "FK_9368cb7db66238cb907a2512d40"`);
        await queryRunner.query(`COMMENT ON COLUMN "products"."id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "UQ_0806c755e0aca124e67c0cf6d7d" UNIQUE ("id")`);
        await queryRunner.query(`COMMENT ON COLUMN "subscriptions"."id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "UQ_a87248d73155605cf782be9ee5e" UNIQUE ("id")`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_41cc0b0f511c1d6114694af7dda"`);
        await queryRunner.query(`COMMENT ON COLUMN "plans"."id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "plans" ADD CONSTRAINT "UQ_3720521a81c7c24fe9b7202ba61" UNIQUE ("id")`);
        await queryRunner.query(`CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "sections" ADD CONSTRAINT "FK_d3ab5c91b473c16b6b9944ec794" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_41cc0b0f511c1d6114694af7dda" FOREIGN KEY ("plansId") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plans" ADD CONSTRAINT "FK_9368cb7db66238cb907a2512d40" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plans" DROP CONSTRAINT "FK_9368cb7db66238cb907a2512d40"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_41cc0b0f511c1d6114694af7dda"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`);
        await queryRunner.query(`ALTER TABLE "sections" DROP CONSTRAINT "FK_d3ab5c91b473c16b6b9944ec794"`);
        await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
        await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP CONSTRAINT "UQ_3720521a81c7c24fe9b7202ba61"`);
        await queryRunner.query(`COMMENT ON COLUMN "plans"."id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_41cc0b0f511c1d6114694af7dda" FOREIGN KEY ("plansId") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "UQ_a87248d73155605cf782be9ee5e"`);
        await queryRunner.query(`COMMENT ON COLUMN "subscriptions"."id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "UQ_0806c755e0aca124e67c0cf6d7d"`);
        await queryRunner.query(`COMMENT ON COLUMN "products"."id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "plans" ADD CONSTRAINT "FK_9368cb7db66238cb907a2512d40" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_methods" DROP CONSTRAINT "UQ_34f9b8c6dfb4ac3559f7e2820d1"`);
        await queryRunner.query(`COMMENT ON COLUMN "payment_methods"."id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "meta"`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD "meta" json`);
        await queryRunner.query(`ALTER TABLE "sections" RENAME COLUMN "pageId" TO "pagesId"`);
        await queryRunner.query(`CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sections" ADD CONSTRAINT "FK_67aad1a5683fb3e96f4d0fd778b" FOREIGN KEY ("pagesId") REFERENCES "pages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
