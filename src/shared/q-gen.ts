export const qGen = (() => {
  const Utils = {
    escapeChars: { '\0': '\\0', '\n': '\\n', '\r': '\\r', '\b': '\\b' },
    error(...v: any) {
      console.log(v);
    },
    fmt(str: any, ...args: any) {
      return str.replace(/{([0-9]+)}/g, (m: any, i: any) => args[i]);
    },
    escapeString(value: any) {
      if (typeof value !== 'string') {
        return value;
      }

      return value
        .replace(/[\0\n\r\b\\\'\"]/g, (s) => this.escapeChars[s] || '\\' + s)
        .replace(/\t/g, '\\t')
        .replace(/\x1a/g, '\\Z');
    },
  };
  class QueryBuilder {
    static OPERATORS = {
      equal: {
        type: 'equal',
        nb_inputs: 1,
        multiple: false,
        apply_to: ['string', 'number', 'datetime', 'boolean'],
      },
      not_equal: {
        type: 'not_equal',
        nb_inputs: 1,
        multiple: false,
        apply_to: ['string', 'number', 'datetime', 'boolean'],
      },
      in: {
        type: 'in',
        nb_inputs: 1,
        multiple: true,
        apply_to: ['string', 'number', 'datetime'],
      },
      not_in: {
        type: 'not_in',
        nb_inputs: 1,
        multiple: true,
        apply_to: ['string', 'number', 'datetime'],
      },
      less: {
        type: 'less',
        nb_inputs: 1,
        multiple: false,
        apply_to: ['number', 'datetime'],
      },
      less_or_equal: {
        type: 'less_or_equal',
        nb_inputs: 1,
        multiple: false,
        apply_to: ['number', 'datetime'],
      },
      greater: {
        type: 'greater',
        nb_inputs: 1,
        multiple: false,
        apply_to: ['number', 'datetime'],
      },
      greater_or_equal: {
        type: 'greater_or_equal',
        nb_inputs: 1,
        multiple: false,
        apply_to: ['number', 'datetime'],
      },
      between: {
        type: 'between',
        nb_inputs: 2,
        multiple: false,
        apply_to: ['number', 'datetime'],
      },
      not_between: {
        type: 'not_between',
        nb_inputs: 2,
        multiple: false,
        apply_to: ['number', 'datetime'],
      },
      begins_with: {
        type: 'begins_with',
        nb_inputs: 1,
        multiple: false,
        apply_to: ['string'],
      },
      not_begins_with: {
        type: 'not_begins_with',
        nb_inputs: 1,
        multiple: false,
        apply_to: ['string'],
      },
      contains: {
        type: 'contains',
        nb_inputs: 1,
        multiple: false,
        apply_to: ['string'],
      },
      not_contains: {
        type: 'not_contains',
        nb_inputs: 1,
        multiple: false,
        apply_to: ['string'],
      },
      ends_with: {
        type: 'ends_with',
        nb_inputs: 1,
        multiple: false,
        apply_to: ['string'],
      },
      not_ends_with: {
        type: 'not_ends_with',
        nb_inputs: 1,
        multiple: false,
        apply_to: ['string'],
      },
      is_empty: {
        type: 'is_empty',
        nb_inputs: 0,
        multiple: false,
        apply_to: ['string'],
      },
      is_not_empty: {
        type: 'is_not_empty',
        nb_inputs: 0,
        multiple: false,
        apply_to: ['string'],
      },
      is_null: {
        type: 'is_null',
        nb_inputs: 0,
        multiple: false,
        apply_to: ['string', 'number', 'datetime', 'boolean'],
      },
      is_not_null: {
        type: 'is_not_null',
        nb_inputs: 0,
        multiple: false,
        apply_to: ['string', 'number', 'datetime', 'boolean'],
      },
    };

    conditions = ['AND', 'OR'];
    default_condition = 'AND';

    operators: any = [
      'equal',
      'not_equal',
      'in',
      'not_in',
      'less',
      'less_or_equal',
      'greater',
      'greater_or_equal',
      'between',
      'not_between',
      'begins_with',
      'not_begins_with',
      'contains',
      'not_contains',
      'ends_with',
      'not_ends_with',
      'is_empty',
      'is_not_empty',
      'is_null',
      'is_not_null',
    ];

    getOperatorByType(type: any, doThrow: any) {
      if (type === '-1') {
        return null;
      }

      for (let i = 0, l = this.operators.length; i < l; i++) {
        if (QueryBuilder.OPERATORS[this.operators[i]].type === type) {
          return QueryBuilder.OPERATORS[this.operators[i]];
        }
      }

      Utils.error(
        doThrow !== false,
        'UndefinedOperator',
        'Undefined operator "{0}"',
        type,
      );

      return null;
    }
  }

  class SQLGenerator extends QueryBuilder {
    settings: any = {
      sqlOperators: {
        equal: { op: '= ?' },
        not_equal: { op: '!= ?' },
        in: { op: 'IN(?)', sep: ', ' },
        not_in: { op: 'NOT IN(?)', sep: ', ' },
        less: { op: '< ?' },
        less_or_equal: { op: '<= ?' },
        greater: { op: '> ?' },
        greater_or_equal: { op: '>= ?' },
        between: { op: 'BETWEEN ?', sep: ' AND ' },
        not_between: { op: 'NOT BETWEEN ?', sep: ' AND ' },
        begins_with: { op: 'LIKE(?)', mod: '{0}%' },
        not_begins_with: { op: 'NOT LIKE(?)', mod: '{0}%' },
        contains: { op: 'LIKE(?)', mod: '%{0}%' },
        not_contains: { op: 'NOT LIKE(?)', mod: '%{0}%' },
        ends_with: { op: 'LIKE(?)', mod: '%{0}' },
        not_ends_with: { op: 'NOT LIKE(?)', mod: '%{0}' },
        is_empty: { op: "= ''" },
        is_not_empty: { op: "!= ''" },
        is_null: { op: 'IS NULL' },
        is_not_null: { op: 'IS NOT NULL' },
      },

      sqlRuleOperator: {
        '=': (v: any) => {
          return { val: v, op: v === '' ? 'is_empty' : 'equal' };
        },
        '!=': (v: any) => {
          return { val: v, op: v === '' ? 'is_not_empty' : 'not_equal' };
        },
        LIKE: (v: any) => {
          if (v.slice(0, 1) === '%' && v.slice(-1) === '%') {
            return { val: v.slice(1, -1), op: 'contains' };
          } else if (v.slice(0, 1) === '%') {
            return { val: v.slice(1), op: 'ends_with' };
          } else if (v.slice(-1) === '%') {
            return { val: v.slice(0, -1), op: 'begins_with' };
          } else {
            Utils.error('SQLParse', 'Invalid value for LIKE operator "{0}"', v);
          }
        },
        'NOT LIKE': (v: any) => {
          if (v.slice(0, 1) === '%' && v.slice(-1) === '%') {
            return { val: v.slice(1, -1), op: 'not_contains' };
          } else if (v.slice(0, 1) === '%') {
            return { val: v.slice(1), op: 'not_ends_with' };
          } else if (v.slice(-1) === '%') {
            return { val: v.slice(0, -1), op: 'not_begins_with' };
          } else {
            Utils.error(
              'SQLParse',
              'Invalid value for NOT LIKE operator "{0}"',
              v,
            );
          }
        },
        IN: (v: any) => {
          return { val: v, op: 'in' };
        },
        'NOT IN': (v: any) => {
          return { val: v, op: 'not_in' };
        },
        '<': (v: any) => {
          return { val: v, op: 'less' };
        },
        '<=': (v: any) => {
          return { val: v, op: 'less_or_equal' };
        },
        '>': (v: any) => {
          return { val: v, op: 'greater' };
        },
        '>=': (v: any) => {
          return { val: v, op: 'greater_or_equal' };
        },
        BETWEEN: (v: any) => {
          return { val: v, op: 'between' };
        },
        'NOT BETWEEN': (v: any) => {
          return { val: v, op: 'not_between' };
        },
        IS: (v: any) => {
          if (v !== null) {
            Utils.error('SQLParse', 'Invalid value for IS operator');
          }
          const val: any = null;
          return { val, op: 'is_null' };
        },
        'IS NOT': (v: any) => {
          if (v !== null) {
            Utils.error('SQLParse', 'Invalid value for IS operator');
          }

          const val: any = null;
          return { val, op: 'is_not_null' };
        },
      },
      default_condition: this.default_condition,
      sqlStatements: {
        question_mark: () => {
          const params: any = [];
          return {
            add: (rule: any, value: any) => {
              params.push(value);
              return '?';
            },
            run: () => params,
          };
        },

        numbered: (char: any) => {
          if (!char || char.length > 1) char = '$';
          let index = 0;
          const params: any = [];
          return {
            add: (rule: any, value: any) => {
              params.push(value);
              index++;
              return char + index;
            },
            run: () => params,
          };
        },

        named: (char: any) => {
          if (!char || char.length > 1) char = ':';
          const indexes: any = {};
          const params: any = {};
          return {
            add: (rule: any, value: any) => {
              if (!indexes[rule.field]) indexes[rule.field] = 1;
              const key = rule.field + '_' + indexes[rule.field]++;
              params[key] = value;
              return char + key;
            },
            run: () => params,
          };
        },
      },

      sqlRuleStatement: {
        question_mark: (values: any) => {
          let index = 0;
          return {
            parse: (v: any) => (v === '?' ? values[index++] : v),
            esc: (sql: any) => sql.replace(/\?/g, "'?'"),
          };
        },

        numbered: (values: any, char: any) => {
          if (!char || char.length > 1) char = '$';
          const regex1 = new RegExp('^\\' + char + '[0-9]+$');
          const regex2 = new RegExp('\\' + char + '([0-9]+)', 'g');
          return {
            parse: (v: any) => (regex1.test(v) ? values[v.slice(1) - 1] : v),
            esc: (sql: any) => {
              return sql.replace(
                regex2,
                "'" + (char === '$' ? '$$' : char) + "$1'",
              );
            },
          };
        },

        named: (values: any, char: any) => {
          if (!char || char.length > 1) char = ':';
          const regex1 = new RegExp('^\\' + char);
          const regex2 = new RegExp(
            '\\' + char + '(' + Object.keys(values).join('|') + ')',
            'g',
          );
          return {
            parse: (v: any) => (regex1.test(v) ? values[v.slice(1)] : v),
            esc: (sql: any) => {
              return sql.replace(
                regex2,
                "'" + (char === '$' ? '$$' : char) + "$1'",
              );
            },
          };
        },
      },
    };

    operatorMap = {
      '=': 'equal',
      '!=': 'not_equal',
      '<': 'less',
      '<=': 'less_or_equal',
      '>': 'greater',
      '>=': 'greater_or_equal',
      like: 'contains',
    };

    operatorMapKeys = Object.keys(this.operatorMap);

    getStmtConfig(stmt: any) {
      let config = stmt.match(/(question_mark|numbered|named)(?:\((.)\))?/);
      if (!config) config = [null, 'question_mark', undefined];
      return config;
    }

    getSQL(stmt: any, nl: any, data: any) {
      if (!data) {
        return null;
      }

      nl = !!nl ? '\n' : ' ';
      const boolean_as_integer = true;

      if (stmt === true) {
        stmt = 'question_mark';
      }
      if (typeof stmt === 'string') {
        const config: any = this.getStmtConfig(stmt);
        stmt = this.settings.sqlStatements[config[1]](config[2]);
      }
      const parse = (group: any) => {
        if (!group.condition) {
          group.condition = this.settings.default_condition;
        }
        if (['AND', 'OR'].indexOf(group.condition.toUpperCase()) === -1) {
          Utils.error(
            'UndefinedSQLCondition',
            'Unable to build SQL query with condition "{0}"',
            group.condition,
          );
        }
        if (!group.rules) {
          return '';
        }
        const parts: any = [];
        group.rules.forEach((rule: any) => {
          if (rule.rules && rule.rules.length > 0) {
            parts.push('(' + nl + parse(rule) + nl + ')' + nl);
          } else {
            if (this.operatorMapKeys.includes(rule.operator)) {
              rule.operator = this.operatorMap[rule.operator];
            }
            const sqlQ = this.settings.sqlOperators[rule.operator];
            const ope = this.getOperatorByType(rule.operator, undefined);
            let value = '';
            if (sqlQ === undefined) {
              Utils.error(
                'UndefinedSQLOperator',
                'Unknown SQL operation for operator "{0}"',
                rule.operator,
              );
            }
            if (ope.nb_inputs !== 0) {
              if (!(rule.value instanceof Array)) {
                rule.value = [rule.value];
              }
              rule.value.forEach((v: any, i: any) => {
                if (i > 0) {
                  value += sqlQ.sep;
                }
                if (rule.type === 'boolean' && boolean_as_integer) {
                  v = v ? 1 : 0;
                } else if (
                  !stmt &&
                  rule.type !== 'integer' &&
                  rule.type !== 'double' &&
                  rule.type !== 'boolean'
                ) {
                  v = Utils.escapeString(v);
                }
                if (sqlQ.mod) {
                  v = Utils.fmt(sqlQ.mod, v);
                }
                if (stmt) {
                  value += stmt.add(rule, v);
                } else {
                  if (typeof v === 'string') {
                    v = "'" + v + "'";
                  }
                  value += v;
                }
              });
            }
            const sqlFn = (v: any) => {
              return sqlQ.op.replace('?', () => {
                return v;
              });
            };
            const field = rule.field;
            const ruleExpression = field + ' ' + sqlFn(value);
            parts.push(ruleExpression);
          }
        });
        const groupExpression = parts.join(' ' + group.condition + nl);
        return groupExpression;
      };
      const sql = parse(data);
      if (stmt) {
        return { sql: sql, params: stmt.run() };
      } else {
        return { sql };
      }
    }
  }
  return (d: any, q = true, n = false) => new SQLGenerator().getSQL(q, n, d);
})();

/*
{
  "condition": "AND",
  "rules": [
    {
      "id": "price",
      "field": "price",
      "type": "double",
      "input": "number",
      "operator": "less",
      "value": 10.25
    },
    {
      "condition": "OR",
      "rules": [
        {
          "id": "category",
          "field": "category",
          "type": "integer",
          "input": "select",
          "operator": "equal",
          "value": 2
        },
        {
          "id": "category",
          "field": "category",
          "type": "integer",
          "input": "select",
          "operator": "equal",
          "value": 1
        },
        {
          "id": "in_stock",
          "field": "in_stock",
          "type": "integer",
          "input": "radio",
          "operator": "equal",
          "value": 1
        }
      ]
    },
    {
      "id": "category",
      "field": "category",
      "type": "integer",
      "input": "select",
      "operator": "not_equal",
      "value": 3
    },
    {
      "id": "name",
      "field": "name",
      "type": "string",
      "input": "text",
      "operator": "begins_with",
      "value": "red,"
    }
  ],
  "valid": true
}
 */
