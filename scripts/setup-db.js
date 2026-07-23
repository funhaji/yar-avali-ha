const { neon } = require('@neondatabase/serverless');

async function setupDatabase() {
  console.log('🔧 Setting up database...\n');
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.error('Please set DATABASE_URL in your environment or .env.local file');
    process.exit(1);
  }
  
  const sql = neon(dbUrl);
  
  try {
    console.log('📋 Creating tables...');
    
    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`;
    console.log('✓ Users table created');
    
    // Sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(512) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)`;
    console.log('✓ Sessions table created');
    
    // Subscription links table
    await sql`
      CREATE TABLE IF NOT EXISTS subscription_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        max_redemptions INT NOT NULL,
        current_redemptions INT DEFAULT 0,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscription_links_code ON subscription_links(code)`;
    console.log('✓ Subscription links table created');
    
    // Subscriptions table
    await sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subscription_link_id UUID REFERENCES subscription_links(id),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date)`;
    console.log('✓ Subscriptions table created');
    
    // Content items table
    await sql`
      CREATE TABLE IF NOT EXISTS content_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        title_en VARCHAR(500),
        description TEXT NOT NULL,
        content_type VARCHAR(50) NOT NULL,
        tier_requirement VARCHAR(50) NOT NULL,
        age_tag VARCHAR(50),
        grade_level VARCHAR(50),
        category VARCHAR(100),
        genre VARCHAR(100),
        series_title VARCHAR(500),
        episode_number INT,
        duration_seconds INT,
        video_url VARCHAR(1000),
        pixeldrain_id VARCHAR(255),
        thumbnail_url VARCHAR(1000),
        file_size_bytes BIGINT,
        view_count INT DEFAULT 0,
        published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_type ON content_items(content_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_tier ON content_items(tier_requirement)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_grade ON content_items(grade_level)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_category ON content_items(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_genre ON content_items(genre)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_series ON content_items(series_title)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_published ON content_items(published)`;
    console.log('✓ Content items table created');
    
    // PDF store items table
    await sql`
      CREATE TABLE IF NOT EXISTS pdf_store_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        description TEXT,
        price_cents INT NOT NULL,
        file_url VARCHAR(1000) NOT NULL,
        thumbnail_url VARCHAR(1000),
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ PDF store items table created');
    
    // PDF purchases table
    await sql`
      CREATE TABLE IF NOT EXISTS pdf_purchases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        pdf_item_id UUID NOT NULL REFERENCES pdf_store_items(id),
        purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, pdf_item_id)
      )
    `;
    console.log('✓ PDF purchases table created');
    
    // Store items table
    await sql`
      CREATE TABLE IF NOT EXISTS store_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        description TEXT,
        price_cents INT NOT NULL,
        stock_quantity INT,
        is_digital BOOLEAN DEFAULT false,
        is_free BOOLEAN DEFAULT false,
        thumbnail_url VARCHAR(1000),
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Store items table created');
    
    // Orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        shipping_address TEXT,
        total_cents INT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_gateway_ref VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Orders table created');
    
    // Order items table
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        store_item_id UUID NOT NULL REFERENCES store_items(id),
        quantity INT NOT NULL,
        price_cents INT NOT NULL
      )
    `;
    console.log('✓ Order items table created');
    
    // Teachers table
    await sql`
      CREATE TABLE IF NOT EXISTS teachers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        bio TEXT,
        photo_url VARCHAR(1000),
        sample_work_url VARCHAR(1000),
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Teachers table created');
    
    // Teacher collaboration requests table
    await sql`
      CREATE TABLE IF NOT EXISTS teacher_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Teacher requests table created');
    
    // Blog posts table
    await sql`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        author_id UUID REFERENCES users(id),
        thumbnail_url VARCHAR(1000),
        published BOOLEAN DEFAULT false,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published)`;
    console.log('✓ Blog posts table created');
    
    // Workshops table
    await sql`
      CREATE TABLE IF NOT EXISTS workshops (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        date TIMESTAMP,
        location VARCHAR(500),
        thumbnail_url VARCHAR(1000),
        review_text TEXT,
        rating INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Workshops table created');
    
    // Viewing history table
    await sql`
      CREATE TABLE IF NOT EXISTS viewing_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
        progress_seconds INT DEFAULT 0,
        completed BOOLEAN DEFAULT false,
        last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, content_id)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_viewing_history_user ON viewing_history(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_viewing_history_content ON viewing_history(content_id)`;
    console.log('✓ Viewing history table created');
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Create an admin user by registering and running: UPDATE users SET role = \'admin\' WHERE email = \'your@email.com\'');
    console.log('2. Deploy to Vercel or run: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Error setting up database:', error.message);
    console.error(error);
    process.exit(1);
  }
}

setupDatabase();
