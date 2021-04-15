class TableData {
  id: number;
  name: string;
  path: string;
}
const TablesList: any = {
  USERS: new TableData(),
  ROLES: new TableData(),
  FILE: new TableData(),

  USER_ROLE: new TableData(),
  ROLE_HAS_PERMISSION: new TableData(),
  PERMISSIONS: new TableData(),
  USER_HAS_PERMISSIONS: new TableData(),
  TOKEN: new TableData(),
  LANGUAGE: new TableData(),
  EMAIL_VERIFICATIONS: new TableData(),
  FORGOT_PASSWORD: new TableData(),
  PAGES: new TableData(),
  SECTIONS: new TableData(),
  IMAGES: new TableData(),
  POSTS: new TableData(),
  FAQS: new TableData(),
  BUTTONS: new TableData(),
  PRODUCTS: new TableData(),
  PLANS: new TableData(),
  PAYMENT_METHODS: new TableData(),
  SUBSCRIPTIONS: new TableData(),
  TIMEZONES: new TableData(),
  CITY: new TableData(),
  COUNTRY: new TableData(),
  CONTACTS: new TableData(),
  INFLUENCER_CONTACTS: new TableData(),
  INFLUENCER_LINKS: new TableData(),
  INFLUENCER_LINKS_TRACKING: new TableData(),

  SMS_TEMPLATES: new TableData(),
  BROADCASTS: new TableData(),
  BROADCASTS_CONTACTS: new TableData(),
  PRESET_MESSAGES: new TableData(),
  PHONES: new TableData(),
  CONVERSATIONS: new TableData(),
  CONVERSATION_MESSAGES: new TableData(),
};

const numHash = (t: string) =>
  [...t].map((v, i) => (i + 1) * v.charCodeAt(0)).reduce((a, b) => a + b);

const genTablesName: any = ({ p, s }) => {
  Object.keys(TablesList).forEach((v) => {
    TablesList[v].id = numHash(v);
    TablesList[v].name = p + v.toLowerCase() + s;
  });
  const ids = Object.values(TablesList).map((v: any) => v.id);
  if (ids.length !== new Set(ids).size) {
    throw new Error('Non Unique Id');
  }
  return TablesList;
};

export const TABLES = genTablesName({ p: '', s: '' });
