import { Injectable } from '@nestjs/common';
import { CityRepository } from './repos/city.repo';
import fetch from 'node-fetch';
import { CountryEntity } from 'src/entities/country.entity';
import { CityEntity } from 'src/entities/city.entity';
import { CountryRepository } from './repos/country.repo';
import { TimezonesRepository } from './repos/timezone.repo';
import { logger } from '../logs/log.storage';

@Injectable()
export class CityCountryService {
  private baseUrl= 'https://parseapi.back4app.com/classes';
  private headers= {
    'X-Parse-Application-Id': 'mxsebv4KoWIGkRntXwyzg6c6DhKWQuit8Ry9sHja', // This is the fake app's application id
    'X-Parse-Master-Key': 'TpO0j3lG2PmEVMXlKYQACoOXKQrL3lwM0HwR9dbH', // This is the fake app's readonly master key
  };

  constructor(
    public readonly cityRepo: CityRepository,
    public readonly countryRepo: CountryRepository,
    public readonly tzRepo: TimezonesRepository,
  ) {
    
   }
  

  async country() {
    
    const response = await fetch(
      `${this.baseUrl}/Country?count=1&limit=400&order=name&keys=name,emoji,code,native`,
      {
        headers: this.headers
      }
    );
    const data = await response.json(); // Here you have the data that you need
    try {
      //call state and city functions
      
      
      (data.results).forEach(async datum => {
        const _country = new CountryEntity();
        _country.name = datum.name;
        _country.native = datum.native;
        _country.code = datum.code;
        _country.id = datum.objectId;
        try {
          
          await this.countryRepo.save(_country);
          
        } catch (e) {
          console.log(e);
          throw e;
        }
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  }



  async city() {
    const countries = [
      "MEzedNnNVw",
      "uvRzGTBaqW",
      "8rTBsf4ObQ",
      "8XKDe93BnC",
      "s6ejWUPV5j",
      "sv7fjDVISU",
      "khAszEtDXl",
      "8iGu4upB6j",
      "Fs3xs9NlJa",
      "I8RkNYNHa4",
      "emj7gm2L4O",
      "hVs5HyPvID",
      "qCMlm28jY0",
      "8lauBzPLI5",
      "sbCG0KlS9w",
      "mDMzJJXtB2",
      "5xyA61UG1h",
      "gXKD3sCcJI",
      "AWnxgoUzw0",
      "27DB6uofpp",
      "5oTW0cNpxA",
      "TySeDEiFtc",
      "v9SGqANrU2",
      "zVrvUTYEeC",
      "nj3z9SHzzq",
      "ZvhrzA2APU",
      "PdgGA5Y5Tt",
      "lP9UmD2WgK",
      "OWstcXnnAs",
      "9l8d95idZG",
      "3K9cHA3Xp8",
      "qq2ryXaIYG",
      "WUeznxS4oA",
      "mNiifJ3CK4",
      "W1DBYJ0DT4",
      "LHOE9MSsmI",
      "buIC80yx3R",
      "qEgnSc4sip",
      "EpBnGVkBLF",
      "pUFZ2RIIvG",
      "mTtBWeeHCo",
      "LrFc6CEfje",
      "4lgb4MnCu4",
      "CAFBhOmYoF",
      "8lQ5LYAawJ",
      "dnDRHIFqGe",
      "jPsWdF78Gn",
      "8tlFatlW3B",
      "Ovzp6Ca4tr",
      "R3I0XpBMHj",
      "SJvwuMEme7",
      "2Icy8PIAyj",
      "CcOW7twmeX",
      "uj5JYO5BE3",
      "YNRVNxzcFx",
      "6RJs1GA7WP",
      "1KRscl4VTZ",
      "FIdcKBVyI3",
      "7UlxnC5LyT",
      "3SYcv5XaFE",
      "DKDsqKRrNW",
      "K9EoQTanO6",
      "BkDVxFnLbN",
      "uy6B519CzE",
      "w42L24Frj9",
      "hFkwjKITta",
      "neXLLQcOcE",
      "hzdCZRHhIY",
      "rVI3whtxQX",
      "kGAoZ5pH7T",
      "RG4CMN42m1",
      "xoqwbHS99Z",
      "D1Tu0ghkZ3",
      "0iYnsd3adu",
      "nfHDWPtgDF",
      "vBQFvgbzPX",
      "0FjIYpVd8h",
      "Ms1BrT4Gl8",
      "9yGMMYfLDC",
      "2aC5hV2kfd",
      "DGGLf2Q1tS",
      "J7QoCukbse",
      "cXVjaWqsnY",
      "vCIN9WyEHn",
      "usW9VKCd8N",
      "zuCmaUX1g9",
      "S3kieBKF1Q",
      "8DHNNAHDXI",
      "j5lw2HxbXZ",
      "E1fDBUFjuu",
      "Rkb0Ji6GtG",
      "k96wKD7ZpG",
      "l2E7bFn2O6",
      "HhLTUnF1fz",
      "uyLj6RP9AZ",
      "QLFfURjWpu",
      "obivyMu1QI",
      "pM1H87l6Bm",
      "KtRJin3dy9",
      "f5WB3Ij653",
      "5VTtzmVSWN",
      "DlHQBjd2Ke",
      "pOykqMaxZB",
      "wv4OCjRaNi",
      "nvhpnKO5rE",
      "FSUOeNw5vK",
      "AheHxSBPbE",
      "4lBFb6Wpq5",
      "hOu7Is3jvO",
      "egoIFgkxC3",
      "iRCCJGZ3RJ",
      "UN9yBtQstI",
      "cbmMpY1LjE",
      "AVGAFwTSFb",
      "nRlkwMtWiB",
      "hWGVevpYaK",
      "qCcuxOqgkB",
      "IAwJVS7NjJ",
      "qlkgJorlNV",
      "KoZCNHDS5X",
      "eaNpdUY6IC",
      "SRLc1TCwHn",
      "P2wZxWNxtr",
      "fl5yo1HfMR",
      "ZoFyPeNM5E",
      "FgwdDPUXmJ",
      "f83FzMh6Ty",
      "9kbcTFZyKo",
      "5LNFOuO2Wh",
      "larowCNukg",
      "09fXl7u3FD",
      "clpCIxZu1P",
      "SHOmq2VQlZ",
      "ovfuQeRszZ",
      "jreQzrjZx6",
      "HEXUplP1Se",
      "ZTZhlMFIyJ",
      "zA1OoRvjvL",
      "1hYnFHML5d",
      "cxnFBlqeWx",
      "987PhBD5EQ",
      "jbrIeE76hr",
      "Y3YvNEgaqp",
      "bmYANF81hv",
      "nE8gX0MFSZ",
      "76H3yHIo7U",
      "wY0pApCtUt",
      "zowYF6xHFj",
      "Smz1hTRSIU",
      "9CVfAKT2WO",
      "cz9fi68eVU",
      "cJ8QXx4aDG",
      "dhD7xYDFi6",
      "uq5oiRuEKm",
      "9FyUSGZNnf",
      "7Ewydti2W5",
      "2vGNu7Yn7D",
      "sCGe1vsv7x",
      "lpk34LaX1T",
      "oqts6mjw76",
      "QJRUbL4g9z",
      "NHfUsjuEP3",
      "cbUYyXWdUS",
      "dAH4X1RHQb",
      "cljDTSxy5A",
      "T6MXJLAUjG",
      "ta4EmTNWmu",
      "YE4pRFqDqA",
      "9r4GHFt1Gt",
      "yP5OXMfgmQ",
      "fjNf3u1Mx1",
      "uonlBdxrxQ",
      "4GJnHdhGyv",
      "8IhgzPlSIn",
      "pmnzGTREty",
      "wo6WYeq2XC",
      "bejQecXKxm",
      "EZzqrmo1am",
      "Gk9CYF6qoa",
      "fadJTpiTZO",
      "5jipXp430E",
      "ZRHFFbzHPq",
      "5QOfVVtfWk",
      "vg1c2CxgQ3",
      "vtGcP4T5wj",
      "akNOeSv404",
      "S4rLvSxvNl",
      "wHnODFxZFO",
      "GOaMR5GKXm",
      "ta7ARILnW0",
      "iiFNu3iWEe",
      "SaCgGB3Wn9",
      "FgCSmJ0kEH",
      "80T3vlLgy2",
      "0fiEmgrqKa",
      "PqGe1JXHMY",
      "loX389odU1",
      "AqY4dkqJok",
      "vRMloHTZn5",
      "xzEkRDMtUU",
      "AnLxFNCcFS",
      "nc6YPq9LzZ",
      "2PuVugMMXs",
      "oQQC8mAbuz",
      "7LyrWI5wCC",
      "0ncikAUv2i",
      "LQBwxAvUsE",
      "SyJ1XgC9NA",
      "H27W1K2Jx0",
      "ICkEMQPTMM",
      "5Vs8zprtNC",
      "9N0Bhm2Ge4",
      "uPVdFzQ71M",
      "iNVlDu9rb9",
      "HmcygKfUvr",
      "uVLeKcyCeh",
      "220UohZbeo",
      "c2ZdW21DZq",
      "aCjqJX3che",
      "UnNh8r7cvJ",
      "temdDhXHMy",
      "UIOtsTw0oX",
      "k2lukc4AyV",
      "LlF4qcKuXw",
      "xxYK5gIxUh",
      "jYnYAs4gVv",
      "CseuLCM1Du",
      "6FCCfIIcf0",
      "r1dBFhG3I7",
      "qURMHRB5Bh",
      "bzZECrPB6P",
      "R9v6O9hXN8",
      "9noh09Cgce",
      "qMGd0YmE4G",
      "VrjHD4Le7A",
      "CzhIuuHOMH",
      "VqASvLCk8S",
      "asMYxtQNZx",
      "BXkZTl2omc",
      "R0GyWd9YXw",
      "E4wHs4HoxE",
      "z3FhnVKZEk",
      "HkXpCV8aEI",
      "RJHFlkiRRU",
      "MFNxWtOZIm",
      "t6iLvc2Vki",
      "cRUrTJH6np",
      "9tt1nNL4xu",
      "Hf8Po3Jb1p",
      "hvaqvemFp8",
    ];
    countries.forEach(async country => {
      const where = encodeURIComponent(JSON.stringify({
        "country": {
          "__type": "Pointer",
          "className": "Country",
          "objectId": country,
        }
      }));
      const response = await fetch(
        `${this.baseUrl}/City?count=1&limit=100000&order=name&keys=name,cityId&where=${where}`,
        {
          headers: this.headers
        }
      );
      const data = await response.json(); // Here you have the data that you need
  
      (data.results).forEach(async datum => {
        const _city = new CityEntity();
        _city.name = datum.name;
        _city.id = datum.objectId;
        //_city.country = country;
        logger.info(_city);
        //await this.cityRepo.save(_city);
      });
    
    })
    
  }

}
