interface ISettingsMap {
    'rotationshastighet': number;
    'rotera vänster': number;
    'rotera höger': number;
    'stapla bitar': number;
    'sprid bitar': number;
    'markera fler': number;
    'visa fps räknare': number;
    'invertera zoom': number;
    'rotera med 3 fingrar': number;
    'bakgrundsfärg': number;
}
type ISetting = keyof ISettingsMap;

interface IWritableSettings {
    updateBinding: (key: ISetting, value: number | string | boolean) => void;
}
interface IReadableSettings {
    readonly keys: ISetting[];
    getValue: (key: ISetting) => number;
}

type IReadWriteSettings = IWritableSettings & IReadableSettings;