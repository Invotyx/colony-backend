import {MigrationInterface, QueryRunner} from "typeorm";

export class buttonsAndOtherContentFixes1612770989580 implements MigrationInterface {
    name = 'buttonsAndOtherContentFixes1612770989580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`);
        await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
        await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "meta"`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD "meta" json`);
        await queryRunner.query(`COMMENT ON COLUMN "buttons"."type" IS NULL`);
        await queryRunner.query(`ALTER TABLE "buttons" DROP CONSTRAINT "UQ_550734c6e2d28134ed88a4f793c"`);
        await queryRunner.query(`CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`);
        await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
        await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
        await queryRunner.query(`ALTER TABLE "buttons" ADD CONSTRAINT "UQ_550734c6e2d28134ed88a4f793c" UNIQUE ("type")`);
        await queryRunner.query(`COMMENT ON COLUMN "buttons"."type" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "meta"`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD "meta" json`);
        await queryRunner.query(`CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
