interface RawDbQueryResult<T = any> {
  rows: T[]
}

interface DbQuerySuccessResult<T> {
  success: true;
  data: T;
  error?: never;
}

interface DbQueryErrorResult {
  success: false;
  data?: never;
  error: string;
}

export type DbQueryResult<T = any> = DbQuerySuccessResult<T> | DbQueryErrorResult;

export interface DbInterface {
  query: (query: string, params?: any[]) => Promise<RawDbQueryResult>
}