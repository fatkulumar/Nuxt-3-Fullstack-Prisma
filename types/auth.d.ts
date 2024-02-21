export type User = {
  id: number;
  first_name: string;
  last_name: string;
  uuid: string;
  email: string;
  password: string;
  permissions: string | null;
  avatar?: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "GENERAL";
  csrf_token?: string;
  current_password?: string;
  new_password?: string;
  email_verified: boolean;
  is_active: boolean;
  last_login: Date | null;
  created_at: Date;
};

export type JSONResponse = {
  status: "success" | "fail";
  data?: any;
  error?: any;
};

export type TokensSession = {
  accessToken: string;
  refreshToken: string;
  sid?: string;
};

export type Session = {
  id: number;
  user_id: number;
  sid: string;
  start_time: DateTime;
  end_time?: DateTime;
  access_token: string;
  csrf_token: string;
  is_active: boolean;
  ip_address: string;
};

export type ProviderUser = {
  id: number;
  provider: "GOOGLE";
  provider_user_id: string;
  user_id: number;
};

export type NxLink = {
  name: string;
  link?: string;
  disabled?: boolean;
  show?: boolean;
  hasBorder?: boolean;
  showChildren?: boolean;
  children?: Links;
  bold?: boolean;
  group?: string;
};

export type NxFormInput = {
  label?: string;
  id: string;
  type?:
    | "input:text"
    | "input:password"
    | "input:email"
    | "input:number"
    | "textarea"
    | "select";
  options?: Array<string>;
  disabled?: boolean;
  show?: boolean;
  value?: string;
};

export type NxLinks = Array<NxLink>;
