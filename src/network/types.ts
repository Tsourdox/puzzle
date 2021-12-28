interface ISerializable<S, D> {
    isModified: boolean;
    serialize: () => S;
    deserialize: (object: D, options?: IDeserializeOptions) => Promise<void>;
}

type IDeserializeOptions = {
    lerp?: boolean;
    roomChanged?: boolean;
} | undefined;

interface ISerializablePuzzle extends ISerializable<IPuzzleData, IPuzzleData> {
    pieces: ReadonlyArray<ISerializablePiece>;
}

interface ISerializablePiece extends ISerializable<ISerializedPieceData, IDeserializedPieceData> {
    isSelectedByOther: boolean;
}
interface ISerializableGraph extends ISerializable<IGraphData, IGraphData> {}

/* ---------------------------------------------------------------------------- */

interface IPuzzleData {
    image: string;
    pieceCount: Point;
    seed: number;
    updatedBy?: string;
}

interface IPieceData {
    id: number;
    rotation: number;
    translation: Point;
    connectedSides?: number[];
    elevation: number;
}
interface ISerializedPieceData extends IPieceData {
    isSelected: boolean
};
interface IDeserializedPieceData extends IPieceData {
    isSelectedByOther: boolean
};

interface IGraphData {
    scale: number;
    translation: Point;
}