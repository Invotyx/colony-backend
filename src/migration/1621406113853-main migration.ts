import { MigrationInterface, QueryRunner } from 'typeorm';

export class mainMigration1621406113853 implements MigrationInterface {
  name = 'mainMigration1621406113853';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "influencer_contacts" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "contactId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_3a91f61fd35430b525cea602d3c" PRIMARY KEY ("id", "userId", "contactId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "influencer_links" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "link" character varying(255) NOT NULL, "urlMapper" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer, CONSTRAINT "PK_b708e996ea32bc25480e718499c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "influencer_links_tracking" ("id" SERIAL NOT NULL, "sent" boolean NOT NULL DEFAULT false, "isOpened" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "influencerLinkId" integer NOT NULL, "contactId" integer NOT NULL, CONSTRAINT "PK_282058160f1cf32a10645ef6992" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "contacts_gender_enum" AS ENUM('male', 'female', 'non_binary')`,
    );
    await queryRunner.query(
      `CREATE TABLE "contacts" ("id" SERIAL NOT NULL, "name" character varying(100), "phoneNumber" character varying(20) NOT NULL, "isComplete" boolean NOT NULL DEFAULT false, "gender" "contacts_gender_enum", "dob" TIMESTAMP, "state" character varying(100), "timezone" character varying(100), "urlMapper" character varying(100), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "countryId" character varying(100), "cityId" character varying(100), CONSTRAINT "PK_b99cd40cfd66a99f1571f4f72e6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "conversations" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "phoneId" integer, "contactId" integer, "userId" integer, CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "phones" ("id" SERIAL NOT NULL, "number" character varying(20) NOT NULL, "country" character varying(3) NOT NULL, "features" character varying(100), "sid" character varying(100) DEFAULT null, "status" character varying(10) NOT NULL, "type" character varying(50) DEFAULT 'extra', "renewalDate" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer, CONSTRAINT "PK_30d7fc09a458d7a4d9471bda554" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "plans_interval_enum" AS ENUM('month', 'year')`,
    );
    await queryRunner.query(
      `CREATE TABLE "plans" ("id" character varying(100) NOT NULL, "amount_decimal" numeric NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'USD', "interval" "plans_interval_enum", "active" boolean NOT NULL DEFAULT false, "threshold" numeric NOT NULL DEFAULT '50', "nickname" character varying(100) NOT NULL, "subscriberCost" numeric, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_3720521a81c7c24fe9b7202ba61" UNIQUE ("id"), CONSTRAINT "PK_3720521a81c7c24fe9b7202ba61" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "subscriptions_collection_method_enum" AS ENUM('charge_automatically', 'send_invoice')`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscriptions" ("id" SERIAL NOT NULL, "rId" character varying(100) NOT NULL, "collection_method" "subscriptions_collection_method_enum" NOT NULL DEFAULT 'charge_automatically', "paymentType" character varying(20) NOT NULL, "cancelled" boolean NOT NULL DEFAULT false, "currentStartDate" TIMESTAMP, "currentEndDate" TIMESTAMP, "smsCount" integer DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer NOT NULL, "planId" character varying(100) NOT NULL, "countryId" character varying(100), "phoneId" integer, CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "country" ("id" character varying(100) NOT NULL, "name" character varying(300) NOT NULL, "code" character varying(100) NOT NULL, "native" character varying(100) NOT NULL, "active" boolean NOT NULL DEFAULT false, "smsCost" numeric, "phoneCost" numeric, CONSTRAINT "UQ_bf6e37c231c4f4ea56dcd887269" UNIQUE ("id"), CONSTRAINT "PK_bf6e37c231c4f4ea56dcd887269" PRIMARY KEY ("id")); COMMENT ON COLUMN "country"."active" IS 'Use only with plans.'`,
    );
    await queryRunner.query(
      `CREATE TABLE "city" ("id" character varying(100) NOT NULL, "name" character varying(300) NOT NULL, "countryId" character varying(100), CONSTRAINT "UQ_b222f51ce26f7e5ca86944a6739" UNIQUE ("id"), CONSTRAINT "PK_b222f51ce26f7e5ca86944a6739" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "language" ("id" SERIAL NOT NULL, "title" character varying(100) NOT NULL, "code" character varying(10) NOT NULL, CONSTRAINT "UQ_309191611bdb9820fea5bfa2acd" UNIQUE ("title"), CONSTRAINT "UQ_465b3173cdddf0ac2d3fe73a33c" UNIQUE ("code"), CONSTRAINT "PK_cc0a99e710eb3733f6fb42b1d4c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment_methods" ("id" character varying(100) NOT NULL, "last4_card" character varying(4) NOT NULL, "type" character varying(15), "name" character varying(15) NOT NULL, "default" boolean NOT NULL DEFAULT false, "fingerprint" character varying(50), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer NOT NULL, CONSTRAINT "UQ_34f9b8c6dfb4ac3559f7e2820d1" UNIQUE ("id"), CONSTRAINT "PK_34f9b8c6dfb4ac3559f7e2820d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "preset_messages_trigger_enum" AS ENUM('onBoard', 'noResponse', 'welcome')`,
    );
    await queryRunner.query(
      `CREATE TABLE "preset_messages" ("id" SERIAL NOT NULL, "name" character varying(200) NOT NULL, "body" text NOT NULL, "trigger" "preset_messages_trigger_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer, CONSTRAINT "PK_6ee593b414c47ee4e0fdb91e616" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment_history" ("id" SERIAL NOT NULL, "cost" numeric NOT NULL DEFAULT '0', "costType" character varying(20) NOT NULL, "chargeId" character varying(100) NOT NULL, "description" character varying(255), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer NOT NULL, CONSTRAINT "PK_5fcec51a769b65c0c3c0987f11c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_role" ("userId" integer NOT NULL, "roleId" integer NOT NULL, "meta" json, CONSTRAINT "PK_7b4e17a669299579dfa55a3fc35" PRIMARY KEY ("userId", "roleId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" SERIAL NOT NULL, "role" character varying(60) NOT NULL, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sms_templates" ("id" SERIAL NOT NULL, "body" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer, CONSTRAINT "PK_940ef6d70e5e49587c1a2f3222d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "users_gender_enum" AS ENUM('male', 'female')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "firstName" character varying(60) NOT NULL, "lastName" character varying(60), "username" character varying(60) NOT NULL, "email" character varying(60) NOT NULL, "mobile" character varying(20), "password" character varying(100) NOT NULL, "gender" "users_gender_enum", "dob" TIMESTAMP, "statusMessage" character varying(300), "image" character varying, "isActive" boolean NOT NULL DEFAULT false, "isApproved" boolean NOT NULL DEFAULT false, "consumedSmsCost" numeric NOT NULL DEFAULT '0', "consumedSubscriberCost" numeric NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "timezone" character varying(100) NOT NULL DEFAULT 'Asia/Karachi', "customerId" character varying(100), "meta" json, "urlId" character varying(100) NOT NULL, "languageId" integer, "cityId" character varying(100), "countryId" character varying(100), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_d376a9f93bba651f32a2c03a7d3" UNIQUE ("mobile"), CONSTRAINT "UQ_c6c520dfb9a4d6dd749e73b13de" UNIQUE ("customerId"), CONSTRAINT "UQ_faba227a3416490513d4471f879" UNIQUE ("urlId"), CONSTRAINT "REL_3785318df310caf8cb8e1e37d8" UNIQUE ("cityId"), CONSTRAINT "REL_cc0dc7234854a65964f1a26827" UNIQUE ("countryId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "broadcasts" ("id" SERIAL NOT NULL, "name" character varying(200) NOT NULL, "body" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer, CONSTRAINT "PK_b0586900034d0726bbdcb1b21b2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "broadcasts_contacts" ("id" SERIAL NOT NULL, "isSent" boolean NOT NULL, "status" character varying(20) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "broadcastId" integer, "contactId" integer, CONSTRAINT "PK_991d00608a07f47fbc9675b1b09" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pages" ("id" SERIAL NOT NULL, "title" character varying(200) NOT NULL, "subTitle" character varying(200) NOT NULL, "slug" character varying(250) NOT NULL, "metaDescription" character varying(300), "metaTags" character varying(300), CONSTRAINT "UQ_fe66ca6a86dc94233e5d7789535" UNIQUE ("slug"), CONSTRAINT "PK_8f21ed625aa34c8391d636b7d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "images" ("id" SERIAL NOT NULL, "url" character varying(300) NOT NULL, "title" character varying(100), "imagePosition" character varying(10) DEFAULT 'center', "pageId" integer, "sectionId" integer, CONSTRAINT "UQ_a4d7e908a3574e21ca5f06d0aad" UNIQUE ("url"), CONSTRAINT "PK_1fe148074c6a1a91b63cb9ee3c9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sections" ("id" SERIAL NOT NULL, "title" character varying(200) NOT NULL, "subTitle" text, "content" text, "isActive" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL, "sectionType" character varying(8) NOT NULL DEFAULT 'type1', "pageId" integer NOT NULL, CONSTRAINT "PK_f9749dd3bffd880a497d007e450" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "buttons" ("id" SERIAL NOT NULL, "text" character varying(60) NOT NULL, "link" character varying(300), "type" character varying(60) NOT NULL, "sectionId" integer, CONSTRAINT "PK_0b55de60f80b00823be7aff0de2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "conversation_messages" ("id" SERIAL NOT NULL, "sms" character varying(1000) NOT NULL, "status" character varying(10) NOT NULL, "type" character varying(10) NOT NULL, "sid" character varying(100), "receivedAt" TIMESTAMP DEFAULT null, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "conversationsId" integer, CONSTRAINT "PK_113248f25c4c0a7c179b3f5a609" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "due_payments" ("id" character varying(100) NOT NULL, "cost" numeric NOT NULL DEFAULT '0', "costType" character varying(20) NOT NULL, "userId" integer NOT NULL, CONSTRAINT "UQ_323af4cf3922a5b7bfd9789a516" UNIQUE ("id"), CONSTRAINT "PK_323af4cf3922a5b7bfd9789a516" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "faqs" ("id" SERIAL NOT NULL, "question" character varying(300) NOT NULL, "answer" text, CONSTRAINT "PK_2ddf4f2c910f8e8fa2663a67bf0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "forgot_password" ("id" SERIAL NOT NULL, "newPasswordToken" character varying NOT NULL, "email" character varying NOT NULL, "timestamp" TIMESTAMP NOT NULL, CONSTRAINT "UQ_e193e226d1b1295f32ccec51147" UNIQUE ("email"), CONSTRAINT "PK_9b1bedb8b9dd6834196533ee41b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" SERIAL NOT NULL, "action" character varying(60) NOT NULL, "subject" character varying(60) NOT NULL, "meta" json NOT NULL, CONSTRAINT "UQ_c9cd48649b85cbed355d3e113f7" UNIQUE ("action", "subject"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "posts" ("id" SERIAL NOT NULL, "title" character varying(200) NOT NULL, "subTitle" character varying(200), "slug" character varying(250) NOT NULL, "content" text, CONSTRAINT "UQ_54ddf9075260407dcfdd7248577" UNIQUE ("slug"), CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_has_permission" ("roleId" integer NOT NULL, "permId" integer NOT NULL, CONSTRAINT "PK_c1f78d13c4cf1dcb076cb6ec5e7" PRIMARY KEY ("roleId", "permId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "timezones" ("id" character varying(100) NOT NULL, "timezone" character varying(300) NOT NULL, "utc" integer, CONSTRAINT "UQ_589871db156cc7f92942334ab7e" UNIQUE ("id"), CONSTRAINT "PK_589871db156cc7f92942334ab7e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_has_permissions" ("userId" integer NOT NULL, "permId" integer NOT NULL, CONSTRAINT "PK_3ce2da2b4e924aa4bd5e2de2775" PRIMARY KEY ("userId", "permId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "email_verifications" ("id" SERIAL NOT NULL, "emailToken" character varying NOT NULL, "email" character varying NOT NULL, "timestamp" TIMESTAMP NOT NULL, CONSTRAINT "UQ_44e5cfea68f87243cad38bb1b1f" UNIQUE ("email"), CONSTRAINT "PK_c1ea2921e767f83cd44c0af203f" PRIMARY KEY ("id"))`,
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
      `ALTER TABLE "influencer_links" ADD CONSTRAINT "FK_b0f3a9cb1802ae0ed1ef9a85460" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_links_tracking" ADD CONSTRAINT "FK_6ea8c26efbdc738965b72ddf8e3" FOREIGN KEY ("influencerLinkId") REFERENCES "influencer_links"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_links_tracking" ADD CONSTRAINT "FK_912e2beda5d01832f7ee99a45b3" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contacts" ADD CONSTRAINT "FK_37c7a529302085865a7167a053e" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contacts" ADD CONSTRAINT "FK_c201ec50615be39c20fbc5bc039" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" ADD CONSTRAINT "FK_c9a1f768bbe5b58384f2a5bef02" FOREIGN KEY ("phoneId") REFERENCES "phones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" ADD CONSTRAINT "FK_c6b7bd06b2ed2058982f4572961" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" ADD CONSTRAINT "FK_a9b3b5d51da1c75242055338b59" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "phones" ADD CONSTRAINT "FK_fa1d95d0c615b8f040ae4179955" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_7536cba909dd7584a4640cad7d5" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_14d17ebae18685a02c50d543897" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_2b633ccf8146814e43c8cb918ef" FOREIGN KEY ("phoneId") REFERENCES "phones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "city" ADD CONSTRAINT "FK_990b8a57ab901cb812e2b52fcf0" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_methods" ADD CONSTRAINT "FK_580f1dbf7bceb9c2cde8baf7ff4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "preset_messages" ADD CONSTRAINT "FK_1b429cee2c8a5c7d37f79d7b140" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_history" ADD CONSTRAINT "FK_34d643de1a588d2350297da5c24" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sms_templates" ADD CONSTRAINT "FK_57857471281ce7bdad4d852fabe" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_43e931f63c91f094d879aeeea29" FOREIGN KEY ("languageId") REFERENCES "language"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_3785318df310caf8cb8e1e37d85" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_cc0dc7234854a65964f1a268275" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "broadcasts" ADD CONSTRAINT "FK_73a8489561d16a4ff153f43c0c4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "broadcasts_contacts" ADD CONSTRAINT "FK_8da4b0c5939e7c26f5f52f680b2" FOREIGN KEY ("broadcastId") REFERENCES "broadcasts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "broadcasts_contacts" ADD CONSTRAINT "FK_8226d8f73cd757cb88903567b54" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "images" ADD CONSTRAINT "FK_bc0035a1151c32f3fa842954c99" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "images" ADD CONSTRAINT "FK_2c33e1aab0bbeb49f3c1ca8349b" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sections" ADD CONSTRAINT "FK_d3ab5c91b473c16b6b9944ec794" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "buttons" ADD CONSTRAINT "FK_f5685c79de8a4757fe9fc1ec09b" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation_messages" ADD CONSTRAINT "FK_78545a79f97dcd1e70d04e366fd" FOREIGN KEY ("conversationsId") REFERENCES "conversations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "due_payments" ADD CONSTRAINT "FK_9c326e902467d3aed2a522d294c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_has_permission" ADD CONSTRAINT "FK_3fddbb7d0c773f1bda2e281e57b" FOREIGN KEY ("permId") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_has_permission" ADD CONSTRAINT "FK_b011e63f8f8ee6ca14474f25dbd" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_has_permissions" ADD CONSTRAINT "FK_b13ffb2f9c10d9cef776346c87e" FOREIGN KEY ("permId") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_has_permissions" ADD CONSTRAINT "FK_11e5563f3670fd042c68718a505" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_has_permissions" DROP CONSTRAINT "FK_11e5563f3670fd042c68718a505"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_has_permissions" DROP CONSTRAINT "FK_b13ffb2f9c10d9cef776346c87e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_has_permission" DROP CONSTRAINT "FK_b011e63f8f8ee6ca14474f25dbd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_has_permission" DROP CONSTRAINT "FK_3fddbb7d0c773f1bda2e281e57b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "due_payments" DROP CONSTRAINT "FK_9c326e902467d3aed2a522d294c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation_messages" DROP CONSTRAINT "FK_78545a79f97dcd1e70d04e366fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "buttons" DROP CONSTRAINT "FK_f5685c79de8a4757fe9fc1ec09b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sections" DROP CONSTRAINT "FK_d3ab5c91b473c16b6b9944ec794"`,
    );
    await queryRunner.query(
      `ALTER TABLE "images" DROP CONSTRAINT "FK_2c33e1aab0bbeb49f3c1ca8349b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "images" DROP CONSTRAINT "FK_bc0035a1151c32f3fa842954c99"`,
    );
    await queryRunner.query(
      `ALTER TABLE "broadcasts_contacts" DROP CONSTRAINT "FK_8226d8f73cd757cb88903567b54"`,
    );
    await queryRunner.query(
      `ALTER TABLE "broadcasts_contacts" DROP CONSTRAINT "FK_8da4b0c5939e7c26f5f52f680b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "broadcasts" DROP CONSTRAINT "FK_73a8489561d16a4ff153f43c0c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_cc0dc7234854a65964f1a268275"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_3785318df310caf8cb8e1e37d85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_43e931f63c91f094d879aeeea29"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sms_templates" DROP CONSTRAINT "FK_57857471281ce7bdad4d852fabe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_history" DROP CONSTRAINT "FK_34d643de1a588d2350297da5c24"`,
    );
    await queryRunner.query(
      `ALTER TABLE "preset_messages" DROP CONSTRAINT "FK_1b429cee2c8a5c7d37f79d7b140"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_methods" DROP CONSTRAINT "FK_580f1dbf7bceb9c2cde8baf7ff4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "city" DROP CONSTRAINT "FK_990b8a57ab901cb812e2b52fcf0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_2b633ccf8146814e43c8cb918ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_14d17ebae18685a02c50d543897"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_7536cba909dd7584a4640cad7d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84"`,
    );
    await queryRunner.query(
      `ALTER TABLE "phones" DROP CONSTRAINT "FK_fa1d95d0c615b8f040ae4179955"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" DROP CONSTRAINT "FK_a9b3b5d51da1c75242055338b59"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" DROP CONSTRAINT "FK_c6b7bd06b2ed2058982f4572961"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" DROP CONSTRAINT "FK_c9a1f768bbe5b58384f2a5bef02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contacts" DROP CONSTRAINT "FK_c201ec50615be39c20fbc5bc039"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contacts" DROP CONSTRAINT "FK_37c7a529302085865a7167a053e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_links_tracking" DROP CONSTRAINT "FK_912e2beda5d01832f7ee99a45b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_links_tracking" DROP CONSTRAINT "FK_6ea8c26efbdc738965b72ddf8e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_links" DROP CONSTRAINT "FK_b0f3a9cb1802ae0ed1ef9a85460"`,
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
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" DROP CONSTRAINT "PK_45170f07127ff6f89c97d2d64b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_contacts" ADD CONSTRAINT "PK_3a91f61fd35430b525cea602d3c" PRIMARY KEY ("id", "userId", "contactId")`,
    );
    await queryRunner.query(`DROP TABLE "email_verifications"`);
    await queryRunner.query(`DROP TABLE "user_has_permissions"`);
    await queryRunner.query(`DROP TABLE "timezones"`);
    await queryRunner.query(`DROP TABLE "role_has_permission"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "forgot_password"`);
    await queryRunner.query(`DROP TABLE "faqs"`);
    await queryRunner.query(`DROP TABLE "due_payments"`);
    await queryRunner.query(`DROP TABLE "conversation_messages"`);
    await queryRunner.query(`DROP TABLE "buttons"`);
    await queryRunner.query(`DROP TABLE "sections"`);
    await queryRunner.query(`DROP TABLE "images"`);
    await queryRunner.query(`DROP TABLE "pages"`);
    await queryRunner.query(`DROP TABLE "broadcasts_contacts"`);
    await queryRunner.query(`DROP TABLE "broadcasts"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "users_gender_enum"`);
    await queryRunner.query(`DROP TABLE "sms_templates"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "user_role"`);
    await queryRunner.query(`DROP TABLE "payment_history"`);
    await queryRunner.query(`DROP TABLE "preset_messages"`);
    await queryRunner.query(`DROP TYPE "preset_messages_trigger_enum"`);
    await queryRunner.query(`DROP TABLE "payment_methods"`);
    await queryRunner.query(`DROP TABLE "language"`);
    await queryRunner.query(`DROP TABLE "city"`);
    await queryRunner.query(`DROP TABLE "country"`);
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TYPE "subscriptions_collection_method_enum"`);
    await queryRunner.query(`DROP TABLE "plans"`);
    await queryRunner.query(`DROP TYPE "plans_interval_enum"`);
    await queryRunner.query(`DROP TABLE "phones"`);
    await queryRunner.query(`DROP TABLE "conversations"`);
    await queryRunner.query(`DROP TABLE "contacts"`);
    await queryRunner.query(`DROP TYPE "contacts_gender_enum"`);
    await queryRunner.query(`DROP TABLE "influencer_links_tracking"`);
    await queryRunner.query(`DROP TABLE "influencer_links"`);
    await queryRunner.query(`DROP TABLE "influencer_contacts"`);
  }
}
