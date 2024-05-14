import { baseRole } from "../baseRole_d";

export interface login extends baseRole {
  userName: string;
  password: string;
}