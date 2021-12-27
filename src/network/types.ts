interface ISerializable<S, D> {
    isModified: boolean;
    serialize: () => S;
    deserialize: (object: D, options?: DeserializeOptions) => Promise<void>;
}

type DeserializeOptions = {
    lerp?: boolean;
    roomChanged?: boolean;
} | undefined;

interface ISerializablePuzzle extends ISerializable<PuzzleData, PuzzleData> {
    pieces: ReadonlyArray<ISerializablePiece>;
}

interface ISerializablePiece extends ISerializable<SerializedPieceData, DeserializedPieceData> {}
interface ISerializableGraph extends ISerializable<GraphData, GraphData> {}

/* ---------------------------------------------------------------------------- */

interface PuzzleData {
    image: string;
    pieceCount: Point;
    seed: number;
    updatedBy?: string;
}

interface PieceData {
    id: number;
    rotation: number;
    translation: Point;
    connectedSides?: number[];
    elevation: number;
}
interface SerializedPieceData extends PieceData {
    isSelected: boolean
};
interface DeserializedPieceData extends PieceData {
    isSelected: boolean,
    isSelectedByOther: boolean
};

interface GraphData {
    scale: number;
    translation: Point;
}