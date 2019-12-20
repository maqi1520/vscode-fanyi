export interface Iparams {
  keyfrom: string;
  key: string;
  type: string;
  doctype: string;
  version: string;
  q: any;
}

export interface IQuery {
  q: string;
  apiname: string;
  apikey: string;
}
export interface Iconfig {
  translateZhCN: boolean;
  useGoogleAPI: boolean;
  apiname: string;
  apikey: string;
}
export type fileDataLine = [string, string | null, string | null];
export type fileTextData = fileDataLine[];
