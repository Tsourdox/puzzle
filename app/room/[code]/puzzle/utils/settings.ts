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
  'rotera vänster': 10, // KEY_Z,
  'rotera höger': 10, // KEY_X,
  'stapla bitar': 10, // SPACE,
  'sprid bitar': 10, // KEY_C,
  'markera fler': 10, // SHIFT,
  'koppla om bitar': 10, // KEY_R,
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
