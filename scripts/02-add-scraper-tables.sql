-- Scraper jobs table
CREATE TABLE IF NOT EXISTS scraper_jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  search_query VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  total_results INTEGER DEFAULT 0,
  leads_created INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Scraped leads (temporary storage before adding to leads table)
CREATE TABLE IF NOT EXISTS scraped_leads (
  id SERIAL PRIMARY KEY,
  scraper_job_id INTEGER NOT NULL REFERENCES scraper_jobs(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_name VARCHAR(255),
  phone VARCHAR(20),
  website VARCHAR(255),
  email VARCHAR(255),
  city VARCHAR(255),
  notes TEXT,
  source VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_scraper_jobs_user_id ON scraper_jobs(user_id);
CREATE INDEX idx_scraper_jobs_status ON scraper_jobs(status);
CREATE INDEX idx_scraped_leads_user_id ON scraped_leads(user_id);
CREATE INDEX idx_scraped_leads_job_id ON scraped_leads(scraper_job_id);
