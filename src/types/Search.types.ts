import { ReactElement } from "react";

export interface Command {
  type: string;
  name: string;
  description: string;
  url?: string;
  icon: ReactElement;
  format: string;
}
export type Suggestion =
  | { type: 'command'; data: Command }
  | { type: 'history'; data: string };