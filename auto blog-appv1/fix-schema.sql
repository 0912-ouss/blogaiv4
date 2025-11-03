-- Add missing columns to articles table if they don't exist

-- Add featured_image column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'featured_image'
    ) THEN
        ALTER TABLE articles ADD COLUMN featured_image VARCHAR(500);
    END IF;
END $$;

-- Add view_count column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'view_count'
    ) THEN
        ALTER TABLE articles ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add author column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'author'
    ) THEN
        ALTER TABLE articles ADD COLUMN author VARCHAR(100) DEFAULT 'Admin';
    END IF;
END $$;

-- Add excerpt column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'excerpt'
    ) THEN
        ALTER TABLE articles ADD COLUMN excerpt TEXT;
    END IF;
END $$;

-- Add status column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'status'
    ) THEN
        ALTER TABLE articles ADD COLUMN status VARCHAR(20) DEFAULT 'published';
    END IF;
END $$;

SELECT 'Schema fix completed! All columns added.' AS result;

