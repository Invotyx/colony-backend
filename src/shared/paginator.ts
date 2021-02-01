import { BadRequestException } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { CommonError } from './common.error';
import { qGen } from './q-gen';

export class PaginatorError extends CommonError {}

export const RulesLengthOverError = (l) =>
  new PaginatorError('RulesLengthOverError', `More than ${l} rules`);

export const RulesDepthOverError = (d) =>
  new PaginatorError('RulesDepthOverError', `Rules depth more than ${d}`);

export const InvalidFilterFieldError = (m?) =>
  new PaginatorError(
    'InvalidFilterFieldError',
    m || 'Invalid field found in filter list'
  );

export const PaginatorErrorHandler = (error: PaginatorError) =>
  new BadRequestException({ message: error.message, error: error.key });

interface PaginatorConfig {
  sort: string;
  order: 'ASC' | 'DESC';
  page: number;
  limit: number;
}
const defaultConfigs: PaginatorConfig = {
  sort: 'id',
  order: 'ASC',
  page: 1,
  limit: 30,
};

const GenConfigs = (x, d = defaultConfigs): PaginatorConfig => {
  return {
    sort: x.sort || d.sort || defaultConfigs.sort,
    order: x.order || d.order || defaultConfigs.order,
    page: x.page || d.page || defaultConfigs.page,
    limit: x.limit || d.limit || defaultConfigs.limit,
  };
};

export interface FilterFieldMapper {
  [key: string]: {
    table: string;
    column: string;
    valueMapper?: Function;
  };
}

const filterFlatter = (x) =>
  x.rules.flatMap((v) => (v.rules ? filterFlatter(v) : v));
const calculateDepth = (x) =>
  x.rules.reduce((a, b) => (b.rules ? a + calculateDepth(b) + 1 : a + 0), 0);

const MAX_DEPTH = 3;
const MAX_LENGTH = 20;

export const dataViewer = ({
  data,
  filterList,
  sortList,
  columnList,
}: {
  data: { filter: any; config: any };
  filterList: FilterFieldMapper;
  sortList;
  columnList: FilterFieldMapper;
}) => {
  const totalRules = filterFlatter(data.filter);
  if (totalRules.length > MAX_LENGTH) {
    throw RulesLengthOverError(MAX_LENGTH);
  }
  const totalFields = [...new Set(totalRules.map((v) => v.field))];
  const possibleFields = Object.keys(filterList);
  const allExist = totalFields.every((v: string) => possibleFields.includes(v));
  if (!allExist) {
    throw InvalidFilterFieldError();
  }
  if (calculateDepth(data.filter) >= MAX_DEPTH) {
    throw RulesDepthOverError(MAX_DEPTH);
  }
  totalRules.forEach((v) => {
    const filedName =
      filterList[v.field].table + '.' + filterList[v.field].column;
    v.field = filedName;
  });
  const filters = qGen(data.filter, false);
  const configs = GenConfigs(data.config);
  return { filters, configs };
};

export const mapColumns = (sample, columnList) => {
  const keys = Object.keys(sample).filter((v) => !!columnList[v]?.valueMapper);
  return (data) => {
    keys.forEach((v) => {
      data[v] = columnList[v].valueMapper(data[v], data);
    });
    return data;
  };
};

export const genMeta = async (query, configs) => {
  const total = await query.getCount();
  const meta = {
    perPage: configs.limit,
    currentPage: configs.page,
    lastPage: Math.ceil(total / configs.limit),
    from: (configs.page - 1) * configs.limit + 1,
    to: configs.page * configs.limit,
    total,
  };
  return meta;
};

export const paginateQuery = async (
  query: SelectQueryBuilder<any>,
  configs,
  table?
) => {
  const tableName = table ? table + '.' : '';
  const res = await Promise.all([
    genMeta(query, configs),
    query
      .offset((configs.page - 1) * configs.limit)
      .limit(configs.limit)
      .orderBy(tableName + configs.sort, configs.order)
      .getRawMany(),
  ]);

  return { data: res[1], meta: res[0] };
};

export const columnListToSelect = (columnList: FilterFieldMapper) => {
  return Object.entries(columnList).map(
    ([k, v]: [any, any]) =>
      `${v.table ? v.table + '.' : ''}${v.column}` + ` as \`${v.as || k}\``
  );
};
