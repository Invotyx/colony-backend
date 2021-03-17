import { MigrationInterface, QueryRunner } from 'typeorm';

export class addedLinksPivotRelation1614929044226
  implements MigrationInterface {
  name = 'addedLinksPivotRelation1614929044226';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
    await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
    await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
    await queryRunner.query(`DROP INDEX "IDX_eb6c00d59daf65d0bef9df3f82"`);
    await queryRunner.query(`DROP INDEX "IDX_8ed56ad1ba2bd0dacfd6ba9316"`);
    await queryRunner.query(
      `CREATE TABLE "influencer_links_tracking" ("id" SERIAL NOT NULL, "sent" boolean NOT NULL DEFAULT false, "isOpened" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "influencerLinkId" integer NOT NULL, CONSTRAINT "REL_6ea8c26efbdc738965b72ddf8e" UNIQUE ("influencerLinkId"), CONSTRAINT "PK_282058160f1cf32a10645ef6992" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "influencer_links_tracking_contact_contacts" ("influencerLinksTrackingId" integer NOT NULL, "contactsId" integer NOT NULL, CONSTRAINT "PK_6948d0fd4461ca40859120ebb50" PRIMARY KEY ("influencerLinksTrackingId", "contactsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4681200d62ef0737f6ab7d065f" ON "influencer_links_tracking_contact_contacts" ("influencerLinksTrackingId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c863449f2d3d4b55f35cccd12" ON "influencer_links_tracking_contact_contacts" ("contactsId") `,
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
      `ALTER TABLE "influencer_links_tracking" ADD CONSTRAINT "FK_6ea8c26efbdc738965b72ddf8e3" FOREIGN KEY ("influencerLinkId") REFERENCES "influencer_links"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_links_tracking_contact_contacts" ADD CONSTRAINT "FK_4681200d62ef0737f6ab7d065f7" FOREIGN KEY ("influencerLinksTrackingId") REFERENCES "influencer_links_tracking"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_links_tracking_contact_contacts" ADD CONSTRAINT "FK_4c863449f2d3d4b55f35cccd12f" FOREIGN KEY ("contactsId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "influencer_links_tracking_contact_contacts" DROP CONSTRAINT "FK_4c863449f2d3d4b55f35cccd12f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_links_tracking_contact_contacts" DROP CONSTRAINT "FK_4681200d62ef0737f6ab7d065f7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_links_tracking" DROP CONSTRAINT "FK_6ea8c26efbdc738965b72ddf8e3"`,
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
    await queryRunner.query(`DROP INDEX "IDX_4c863449f2d3d4b55f35cccd12"`);
    await queryRunner.query(`DROP INDEX "IDX_4681200d62ef0737f6ab7d065f"`);
    await queryRunner.query(
      `DROP TABLE "influencer_links_tracking_contact_contacts"`,
    );
    await queryRunner.query(`DROP TABLE "influencer_links_tracking"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_8ed56ad1ba2bd0dacfd6ba9316" ON "influencer_contacts" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eb6c00d59daf65d0bef9df3f82" ON "influencer_contacts" ("contactId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `,
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
  }
}
