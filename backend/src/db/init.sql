CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  national_code TEXT NOT NULL UNIQUE CHECK (national_code ~ '^[0-9]{6}$'),
  price NUMERIC(10,2) NOT NULL CHECK (price > 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO products (name, national_code, price, stock) VALUES
  ('Paracetamol 1g', '650001', 2.50, 40),
  ('Ibuprofeno 600mg', '650002', 3.90, 25),
  ('Omeprazol 20mg', '650003', 4.80, 12);