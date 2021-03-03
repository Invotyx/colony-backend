import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TABLES } from '../consts/tables.const';
import { CityEntity } from './city.entity';
import { CountryEntity } from './country.entity';
import { InfluencerContactsEntity } from './influencer-contacts.entity';
import { UserEntity } from './user.entity';

enum gender{
  male = "male",
  female = "female",
  non_binary="non_binary"
}

@Entity({ name: TABLES.CONTACTS.name })
export class ContactsEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({ length: 100, nullable: true })
  public name: string;

  @Column({ length: 20, nullable: false })
  public phoneNumber: string;

  @Column({ default: false, nullable: false })
  public isComplete: boolean;

  @Column({ type: 'enum', enum: gender, nullable: true })
  public gender: gender;

  @Column({ nullable: true })
  public dob: Date;

  @ManyToOne(() => CountryEntity,{nullable:true})
  @JoinColumn({ name: 'countryId' })
  public country: CountryEntity;

  @ManyToOne(() => CityEntity,{nullable:true})
  @JoinColumn({ name: 'cityId' })
  public city: CityEntity;

  @Column({ length: 100, nullable: true })
  public state: string;

  @Column({ length: 100, nullable: true })
  public timezone: string;

  @Column({default:false,nullable:false})
  public isVerified: boolean;

  
  @OneToMany(() => InfluencerContactsEntity, (cToI) => cToI.contact)
  public influencerContacts!: InfluencerContactsEntity[];

  @ManyToMany(() => UserEntity, (user) => user.contact,{eager:true})
  @JoinTable({
    name: TABLES.INFLUENCER_CONTACTS.name,
    joinColumn: { name: 'contactId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  user: UserEntity[];

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
