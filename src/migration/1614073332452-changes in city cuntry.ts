import { MigrationInterface, QueryRunner } from 'typeorm';

export class changesInCityCuntry1614073332452 implements MigrationInterface {
  name = 'changesInCityCuntry1614073332452';

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
      `ALTER TABLE "city" DROP CONSTRAINT "FK_990b8a57ab901cb812e2b52fcf0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "country" DROP CONSTRAINT "PK_bf6e37c231c4f4ea56dcd887269"`,
    );
    await queryRunner.query(`ALTER TABLE "country" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "country" ADD "id" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "country" ADD CONSTRAINT "PK_bf6e37c231c4f4ea56dcd887269" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "country" ADD CONSTRAINT "UQ_bf6e37c231c4f4ea56dcd887269" UNIQUE ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "city" DROP CONSTRAINT "PK_b222f51ce26f7e5ca86944a6739"`,
    );
    await queryRunner.query(`ALTER TABLE "city" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "city" ADD "id" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "city" ADD CONSTRAINT "PK_b222f51ce26f7e5ca86944a6739" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "city" ADD CONSTRAINT "UQ_b222f51ce26f7e5ca86944a6739" UNIQUE ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "city" DROP COLUMN "countryId"`);
    await queryRunner.query(
      `ALTER TABLE "city" ADD "countryId" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "timezones" DROP CONSTRAINT "PK_589871db156cc7f92942334ab7e"`,
    );
    await queryRunner.query(`ALTER TABLE "timezones" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "timezones" ADD "id" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "timezones" ADD CONSTRAINT "PK_589871db156cc7f92942334ab7e" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "timezones" ADD CONSTRAINT "UQ_589871db156cc7f92942334ab7e" UNIQUE ("id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "city" ADD CONSTRAINT "FK_990b8a57ab901cb812e2b52fcf0" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "city" DROP CONSTRAINT "FK_990b8a57ab901cb812e2b52fcf0"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
    await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
    await queryRunner.query(
      `ALTER TABLE "timezones" DROP CONSTRAINT "UQ_589871db156cc7f92942334ab7e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timezones" DROP CONSTRAINT "PK_589871db156cc7f92942334ab7e"`,
    );
    await queryRunner.query(`ALTER TABLE "timezones" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "timezones" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "timezones" ADD CONSTRAINT "PK_589871db156cc7f92942334ab7e" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "city" DROP COLUMN "countryId"`);
    await queryRunner.query(`ALTER TABLE "city" ADD "countryId" integer`);
    await queryRunner.query(
      `ALTER TABLE "city" DROP CONSTRAINT "UQ_b222f51ce26f7e5ca86944a6739"`,
    );
    await queryRunner.query(
      `ALTER TABLE "city" DROP CONSTRAINT "PK_b222f51ce26f7e5ca86944a6739"`,
    );
    await queryRunner.query(`ALTER TABLE "city" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "city" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "city" ADD CONSTRAINT "PK_b222f51ce26f7e5ca86944a6739" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "country" DROP CONSTRAINT "UQ_bf6e37c231c4f4ea56dcd887269"`,
    );
    await queryRunner.query(
      `ALTER TABLE "country" DROP CONSTRAINT "PK_bf6e37c231c4f4ea56dcd887269"`,
    );
    await queryRunner.query(`ALTER TABLE "country" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "country" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "country" ADD CONSTRAINT "PK_bf6e37c231c4f4ea56dcd887269" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "city" ADD CONSTRAINT "FK_990b8a57ab901cb812e2b52fcf0" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
