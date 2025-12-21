-- Rooms table (stores puzzle metadata)
CREATE TABLE rooms (
  room_code TEXT PRIMARY KEY,
  puzzle_data JSONB NOT NULL, -- { pieceCount: {x, y}, seed, imageData, size }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pieces table (stores current state of all pieces)
CREATE TABLE pieces (
  id SERIAL PRIMARY KEY,
  room_code TEXT NOT NULL REFERENCES rooms(room_code) ON DELETE CASCADE,
  piece_id INTEGER NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  rotation REAL NOT NULL,
  connected_sides INTEGER[] DEFAULT '{}',
  elevation INTEGER DEFAULT 0,
  updated_by TEXT, -- User ID who last updated this piece
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_code, piece_id)
);

-- Active selections (who's holding what)
CREATE TABLE selections (
  id SERIAL PRIMARY KEY,
  room_code TEXT NOT NULL REFERENCES rooms(room_code) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  piece_ids INTEGER[] NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_code, user_id)
);

-- Indexes for performance
CREATE INDEX idx_pieces_room ON pieces(room_code);
CREATE INDEX idx_selections_room ON selections(room_code);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE pieces;
ALTER PUBLICATION supabase_realtime ADD TABLE selections;

-- RLS (Row Level Security) - allow public access for now
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for rooms" ON rooms FOR ALL USING (true);
CREATE POLICY "Allow all for pieces" ON pieces FOR ALL USING (true);
CREATE POLICY "Allow all for selections" ON selections FOR ALL USING (true);
