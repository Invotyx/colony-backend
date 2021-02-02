import {MigrationInterface, QueryRunner} from "typeorm";

export class MainMigration1612251182127 implements MigrationInterface {
    name = 'MainMigration1612251182127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "forgot_password" ("id" SERIAL NOT NULL, "newPasswordToken" character varying NOT NULL, "email" character varying NOT NULL, "timestamp" TIMESTAMP NOT NULL, CONSTRAINT "UQ_e193e226d1b1295f32ccec51147" UNIQUE ("email"), CONSTRAINT "PK_9b1bedb8b9dd6834196533ee41b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "language" ("id" SERIAL NOT NULL, "title" character varying(100) NOT NULL, "code" character varying(10) NOT NULL, CONSTRAINT "UQ_309191611bdb9820fea5bfa2acd" UNIQUE ("title"), CONSTRAINT "UQ_465b3173cdddf0ac2d3fe73a33c" UNIQUE ("code"), CONSTRAINT "PK_cc0a99e710eb3733f6fb42b1d4c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "permissions" ("id" SERIAL NOT NULL, "action" character varying(60) NOT NULL, "subject" character varying(60) NOT NULL, "meta" json NOT NULL, CONSTRAINT "UQ_c9cd48649b85cbed355d3e113f7" UNIQUE ("action", "subject"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "users_gender_enum" AS ENUM('male', 'female')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "firstName" character varying(60) NOT NULL, "lastName" character varying(60), "username" character varying(60) NOT NULL, "email" character varying(60) NOT NULL, "mobile" character varying(20), "password" character varying(100) NOT NULL, "gender" "users_gender_enum", "age" integer, "location" character varying(20), "statusMessage" character varying(300), "image" character varying, "isActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "meta" json, "languageId" integer, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_d376a9f93bba651f32a2c03a7d3" UNIQUE ("mobile"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_role" ("userId" integer NOT NULL, "roleId" integer NOT NULL, "meta" json, CONSTRAINT "PK_7b4e17a669299579dfa55a3fc35" PRIMARY KEY ("userId", "roleId"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "role" character varying(60) NOT NULL, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role_has_permission" ("roleId" integer NOT NULL, "permId" integer NOT NULL, CONSTRAINT "PK_c1f78d13c4cf1dcb076cb6ec5e7" PRIMARY KEY ("roleId", "permId"))`);
        await queryRunner.query(`CREATE TABLE "user_has_permissions" ("userId" integer NOT NULL, "permId" integer NOT NULL, CONSTRAINT "PK_3ce2da2b4e924aa4bd5e2de2775" PRIMARY KEY ("userId", "permId"))`);
        await queryRunner.query(`CREATE TABLE "email_verifications" ("id" SERIAL NOT NULL, "emailToken" character varying NOT NULL, "email" character varying NOT NULL, "timestamp" TIMESTAMP NOT NULL, CONSTRAINT "UQ_44e5cfea68f87243cad38bb1b1f" UNIQUE ("email"), CONSTRAINT "PK_c1ea2921e767f83cd44c0af203f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "meta"`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD "meta" json`);
        await queryRunner.query(`CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_43e931f63c91f094d879aeeea29" FOREIGN KEY ("languageId") REFERENCES "language"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_has_permission" ADD CONSTRAINT "FK_3fddbb7d0c773f1bda2e281e57b" FOREIGN KEY ("permId") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_has_permission" ADD CONSTRAINT "FK_b011e63f8f8ee6ca14474f25dbd" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_has_permissions" ADD CONSTRAINT "FK_b13ffb2f9c10d9cef776346c87e" FOREIGN KEY ("permId") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_has_permissions" ADD CONSTRAINT "FK_11e5563f3670fd042c68718a505" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_has_permissions" DROP CONSTRAINT "FK_11e5563f3670fd042c68718a505"`);
        await queryRunner.query(`ALTER TABLE "user_has_permissions" DROP CONSTRAINT "FK_b13ffb2f9c10d9cef776346c87e"`);
        await queryRunner.query(`ALTER TABLE "role_has_permission" DROP CONSTRAINT "FK_b011e63f8f8ee6ca14474f25dbd"`);
        await queryRunner.query(`ALTER TABLE "role_has_permission" DROP CONSTRAINT "FK_3fddbb7d0c773f1bda2e281e57b"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_43e931f63c91f094d879aeeea29"`);
        await queryRunner.query(`DROP INDEX "IDX_dba55ed826ef26b5b22bd39409"`);
        await queryRunner.query(`DROP INDEX "IDX_ab40a6f0cd7d3ebfcce082131f"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "meta"`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD "meta" json`);
        await queryRunner.query(`DROP TABLE "email_verifications"`);
        await queryRunner.query(`DROP TABLE "user_has_permissions"`);
        await queryRunner.query(`DROP TABLE "role_has_permission"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "user_role"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "users_gender_enum"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(`DROP TABLE "language"`);
        await queryRunner.query(`DROP TABLE "forgot_password"`);
    }

}
