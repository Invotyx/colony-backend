import { MigrationInterface, QueryRunner } from 'typeorm';

export class contactsEntityAndRelationToUserAdded1614683154179
  implements MigrationInterface {
  name = 'contactsEntityAndRelationToUserAdded1614683154179';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
    await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
    await queryRunner.query(
      `CREATE TABLE "influencer_contacts" ("userId" integer NOT NULL, "contactId" integer NOT NULL, CONSTRAINT "PK_45170f07127ff6f89c97d2d64b2" PRIMARY KEY ("userId", "contactId"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "contacts_gender_enum" AS ENUM('male', 'female', 'non_binary')`,
    );
    await queryRunner.query(
      `CREATE TABLE "contacts" ("id" SERIAL NOT NULL, "name" character varying(100), "phoneNumber" character varying(20) NOT NULL, "isComplete" boolean NOT NULL DEFAULT false, "gender" "contacts_gender_enum", "dob" TIMESTAMP, "state" character varying(100), "timezone" character varying(100), "isVerified" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "countryId" character varying(100), "cityId" character varying(100), CONSTRAINT "PK_b99cd40cfd66a99f1571f4f72e6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "meta"`);
    await queryRunner.query(`ALTER TABLE "user_role" ADD "meta" json`);
    await queryRunner.query(
      `CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eb6c00d59daf65d0bef9df3f82" ON "influencer_contacts" ("contactId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8ed56ad1ba2bd0dacfd6ba9316" ON "influencer_contacts" ("userId") `,
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
    await queryRunner.query(
      `ALTER TABLE "contacts" ADD CONSTRAINT "FK_37c7a529302085865a7167a053e" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contacts" ADD CONSTRAINT "FK_c201ec50615be39c20fbc5bc039" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contacts" DROP CONSTRAINT "FK_c201ec50615be39c20fbc5bc039"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contacts" DROP CONSTRAINT "FK_37c7a529302085865a7167a053e"`,
    );
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
    await queryRunner.query(`DROP INDEX "IDX_8ed56ad1ba2bd0dacfd6ba9316"`);
    await queryRunner.query(`DROP INDEX "IDX_eb6c00d59daf65d0bef9df3f82"`);
    await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
    await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
    await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "meta"`);
    await queryRunner.query(`ALTER TABLE "user_role" ADD "meta" json`);
    await queryRunner.query(`DROP TABLE "contacts"`);
    await queryRunner.query(`DROP TYPE "contacts_gender_enum"`);
    await queryRunner.query(`DROP TABLE "influencer_contacts"`);
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
