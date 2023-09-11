import { KEY_C, KEY_R, KEY_X, KEY_Z, SHIFT, SPACE } from './keys';

export interface ISettingsMap {
  rotationshastighet: number;
  'rotera vänster': number;
  'rotera höger': number;
  'stapla bitar': number;
  'sprid bitar': number;
  'markera fler': number;
  'visa fps räknare': number;
  'invertera zoom': number;
  bakgrundsfärg: number;
  'koppla om bitar': number;
}
export type ISetting = keyof ISettingsMap;

export const settings: ISettingsMap = {
  rotationshastighet: 1,
  'rotera vänster': KEY_Z,
  'rotera höger': KEY_X,
  'stapla bitar': SPACE,
  'sprid bitar': KEY_C,
  'markera fler': SHIFT,
  'koppla om bitar': KEY_R,
  'invertera zoom': 0,
  'visa fps räknare': 0,
  bakgrundsfärg: 40,
};

export interface IWritableSettings {
  updateBinding: (key: ISetting, value: number | string | boolean) => void;
}
export interface IReadableSettings {
  readonly keys: ISetting[];
  getValue: (key: ISetting) => number;
}

export type IReadWriteSettings = IWritableSettings & IReadableSettings;
