/*
  # Sales Analytics Database Schema

  ## Overview
  This migration creates a comprehensive sales analytics database for tracking products, 
  customers, sales transactions, and regional performance metrics.

  ## New Tables

  ### 1. products
  - `id` (uuid, primary key) - Unique product identifier
  - `name` (text) - Product name
  - `category` (text) - Product category (Electronics, Clothing, Food, Books, etc.)
  - `price` (decimal) - Product price
  - `cost` (decimal) - Product cost for profit calculation
  - `created_at` (timestamp) - Record creation time

  ### 2. customers
  - `id` (uuid, primary key) - Unique customer identifier
  - `name` (text) - Customer name
  - `email` (text, unique) - Customer email address
  - `region` (text) - Geographic region (North, South, East, West)
  - `created_at` (timestamp) - Record creation time

  ### 3. sales
  - `id` (uuid, primary key) - Unique sale identifier
  - `product_id` (uuid, foreign key) - Reference to products table
  - `customer_id` (uuid, foreign key) - Reference to customers table
  - `quantity` (integer) - Number of units sold
  - `total_amount` (decimal) - Total sale amount
  - `sale_date` (date) - Date of sale
  - `created_at` (timestamp) - Record creation time

  ### 4. analytics_cache
  - `id` (uuid, primary key) - Unique cache entry identifier
  - `metric_name` (text) - Name of the cached metric
  - `metric_value` (jsonb) - Cached calculation result
  - `updated_at` (timestamp) - Last update time

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Add policies for public read access (suitable for analytics dashboard)
  - Add policies for authenticated insert/update operations

  ## Notes
  - All tables use UUID primary keys for scalability
  - Timestamps use timestamptz for timezone awareness
  - Foreign key constraints ensure data integrity
  - Default values prevent null-related issues
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price decimal(10, 2) NOT NULL CHECK (price >= 0),
  cost decimal(10, 2) NOT NULL CHECK (cost >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  region text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  total_amount decimal(10, 2) NOT NULL CHECK (total_amount >= 0),
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create analytics cache table
CREATE TABLE IF NOT EXISTS analytics_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text UNIQUE NOT NULL,
  metric_value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_customers_region ON customers(region);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products table
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for customers table
CREATE POLICY "Anyone can view customers"
  ON customers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete customers"
  ON customers FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for sales table
CREATE POLICY "Anyone can view sales"
  ON sales FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert sales"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sales"
  ON sales FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sales"
  ON sales FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for analytics_cache table
CREATE POLICY "Anyone can view analytics cache"
  ON analytics_cache FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage analytics cache"
  ON analytics_cache FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample data for demonstration
INSERT INTO products (name, category, price, cost) VALUES
  ('Laptop Pro 15', 'Electronics', 1299.99, 899.99),
  ('Wireless Mouse', 'Electronics', 29.99, 12.99),
  ('USB-C Cable', 'Electronics', 19.99, 5.99),
  ('Cotton T-Shirt', 'Clothing', 24.99, 10.99),
  ('Denim Jeans', 'Clothing', 59.99, 25.99),
  ('Running Shoes', 'Clothing', 89.99, 45.99),
  ('Organic Coffee Beans', 'Food', 14.99, 7.99),
  ('Green Tea Box', 'Food', 9.99, 4.99),
  ('Python Programming Book', 'Books', 49.99, 20.99),
  ('Data Science Guide', 'Books', 59.99, 25.99)
ON CONFLICT DO NOTHING;

INSERT INTO customers (name, email, region) VALUES
  ('Alice Johnson', 'alice.johnson@example.com', 'North'),
  ('Bob Smith', 'bob.smith@example.com', 'South'),
  ('Carol Williams', 'carol.williams@example.com', 'East'),
  ('David Brown', 'david.brown@example.com', 'West'),
  ('Eve Davis', 'eve.davis@example.com', 'North'),
  ('Frank Miller', 'frank.miller@example.com', 'South'),
  ('Grace Wilson', 'grace.wilson@example.com', 'East'),
  ('Henry Moore', 'henry.moore@example.com', 'West'),
  ('Iris Taylor', 'iris.taylor@example.com', 'North'),
  ('Jack Anderson', 'jack.anderson@example.com', 'South')
ON CONFLICT DO NOTHING;

-- Insert sample sales data
INSERT INTO sales (product_id, customer_id, quantity, total_amount, sale_date)
SELECT 
  p.id,
  c.id,
  (RANDOM() * 5 + 1)::integer,
  p.price * (RANDOM() * 5 + 1)::integer,
  CURRENT_DATE - (RANDOM() * 365)::integer
FROM products p
CROSS JOIN customers c
WHERE RANDOM() < 0.3
ON CONFLICT DO NOTHING;