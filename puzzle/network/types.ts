import { PexelsImage } from '@/utils/pexels';
import { Size } from '@/utils/sizes';
import { Point } from '../utils/general';

export interface ISerializable<S, D> {
  isModified: boolean;
  serialize: () => S;
  deserialize: (object: D, options?: IDeserializeOptions) => Promise<void>;
}

export type IDeserializeOptions =
  | {
      lerp?: boolean;
      roomChanged?: boolean;
    }
  | undefined;

export interface ISerializablePuzzle extends ISerializable<IPuzzleData, IPuzzleData> {
  pieces: ReadonlyArray<ISerializablePiece>;
}

export interface ISerializablePiece
  extends ISerializable<ISerializedPieceData, IDeserializedPieceData> {
  isSelectedByOther: boolean;
}
export interface ISerializableGraph extends ISerializable<IGraphData, IGraphData> {}

/* ---------------------------------------------------------------------------- */

export interface IPuzzleData {
  imageData: PexelsImage;
  pieceCount: Point;
  seed: number;
  size: Size;
  updatedBy?: string;
}

export interface IPieceData {
  id: number;
  rotation: number;
  translation: Point;
  connectedSides?: number[];
  elevation: number;
}
export interface ISerializedPieceData extends IPieceData {
  isSelected: boolean;
}
export interface IDeserializedPieceData extends IPieceData {
  isSelectedByOther: boolean;
}

export interface IGraphData {
  scale: number;
  translation: Point;
}
