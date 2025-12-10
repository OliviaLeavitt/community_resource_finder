/*
  # Enable pgvector extension

  1. Extensions
    - Enable `vector` extension for AI-powered semantic search
    - Provides vector data type and similarity search functions
    - Required for storing and querying AI embeddings
*/

CREATE EXTENSION IF NOT EXISTS vector;