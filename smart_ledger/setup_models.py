#!/usr/bin/env python3
"""
Model Downloader Script
Downloads essential Hugging Face models for offline use
"""

import os
import time
from transformers import pipeline, AutoModel, AutoTokenizer

def download_model_info():
    """Information about models we're downloading"""
    models = {
        # TEXT GENERATION
        "gpt2": {
            "task": "text-generation",
            "description": "Generate human-like text, stories, code, emails",
            "size": "~500MB",
            "speed": "Fast",
            "good_for": "Creative writing, code completion, general text"
        },

        # SENTIMENT ANALYSIS
        "distilbert-base-uncased-finetuned-sst-2-english": {
            "task": "sentiment-analysis",
            "description": "Analyze if text is positive or negative",
            "size": "~250MB",
            "speed": "Very Fast",
            "good_for": "Customer reviews, social media monitoring, feedback analysis"
        },

        # SUMMARIZATION
        "facebook/bart-large-cnn": {
            "task": "summarization",
            "description": "Create short summaries of long texts",
            "size": "~1.5GB",
            "speed": "Medium",
            "good_for": "Articles, reports, long documents, research papers"
        },

        # QUESTION ANSWERING
        "deepset/roberta-base-squad2": {
            "task": "question-answering",
            "description": "Answer questions based on provided text",
            "size": "~500MB",
            "speed": "Fast",
            "good_for": "Document search, FAQ systems, reading comprehension"
        },

        # TRANSLATION
        "Helsinki-NLP/opus-mt-en-fr": {
            "task": "translation",
            "description": "Translate English to French",
            "size": "~300MB",
            "speed": "Fast",
            "good_for": "Translating documents, emails, websites"
        },

        # TEXT CLASSIFICATION
        "microsoft/DialoGPT-medium": {
            "task": "text-generation",
            "description": "Conversational AI - chat with the model",
            "size": "~850MB",
            "speed": "Medium",
            "good_for": "Chatbots, conversational interfaces, customer service"
        }
    }
    return models

def check_cache_size():
    """Check current cache size"""
    cache_dir = os.path.expanduser("~/.cache/huggingface")
    if not os.path.exists(cache_dir):
        return 0

    total_size = 0
    for dirpath, dirnames, filenames in os.walk(cache_dir):
        for filename in filenames:
            try:
                filepath = os.path.join(dirpath, filename)
                total_size += os.path.getsize(filepath)
            except (OSError, FileNotFoundError):
                continue
    return total_size / (1024**3)  # Convert to GB

def download_models(selected_models=None):
    """Download models to cache"""
    models_info = download_model_info()

    if selected_models is None:
        selected_models = list(models_info.keys())

    print("🚀 HUGGING FACE MODEL DOWNLOADER")
    print("=" * 50)

    print(f"📁 Cache location: {os.path.expanduser('~/.cache/huggingface')}")
    print(f"💾 Current cache size: {check_cache_size():.2f} GB")
    print()

    total_downloaded = 0
    successful = []
    failed = []

    for i, model_name in enumerate(selected_models, 1):
        if model_name not in models_info:
            print(f"❌ Unknown model: {model_name}")
            continue

        info = models_info[model_name]
        print(f"📦 [{i}/{len(selected_models)}] Downloading: {model_name}")
        print(f"   Purpose: {info['description']}")
        print(f"   Size: {info['size']} | Speed: {info['speed']}")

        try:
            start_time = time.time()

            # Download using pipeline (easiest method)
            pipe = pipeline(info['task'], model=model_name)

            elapsed = time.time() - start_time
            print(f"   ✅ Downloaded in {elapsed:.1f}s")
            print(f"   🎯 Good for: {info['good_for']}")
            successful.append(model_name)
            total_downloaded += 1

        except Exception as e:
            print(f"   ❌ Failed: {str(e)}")
            failed.append((model_name, str(e)))

        print("-" * 50)

    # Summary
    print("\n📊 DOWNLOAD SUMMARY")
    print("=" * 50)
    print(f"✅ Successfully downloaded: {len(successful)} models")
    print(f"❌ Failed downloads: {len(failed)} models")
    print(f"💾 Final cache size: {check_cache_size():.2f} GB")

    if successful:
        print("\n🎉 READY TO USE (offline):")
        for model in successful:
            print(f"   - {model}")

    if failed:
        print("\n⚠️  FAILED DOWNLOADS:")
        for model, error in failed:
            print(f"   - {model}: {error}")

    print(f"\n🔌 Run 'python use_cached_models.py' to test offline usage!")

def show_available_models():
    """Show all available models and their purposes"""
    models_info = download_model_info()

    print("🤖 AVAILABLE MODELS")
    print("=" * 70)

    for model_name, info in models_info.items():
        print(f"📝 {model_name}")
        print(f"   Task: {info['task']}")
        print(f"   What it does: {info['description']}")
        print(f"   Size: {info['size']} | Speed: {info['speed']}")
        print(f"   Best for: {info['good_for']}")
        print("-" * 70)

def main():
    print("🤖 Hugging Face Model Setup")
    print("1. Show available models")
    print("2. Download ALL models (~4GB total)")
    print("3. Download essential models only (~1.5GB)")
    print("4. Custom selection")
    print("5. Check current cache")

    choice = input("\nEnter choice (1-5): ").strip()

    if choice == "1":
        show_available_models()

    elif choice == "2":
        print("\n⚠️  This will download ~4GB of models. Continue? (y/n): ", end="")
        if input().lower().startswith('y'):
            download_models()

    elif choice == "3":
        # Essential models for most common tasks
        essential = [
            "gpt2",  # Text generation
            "distilbert-base-uncased-finetuned-sst-2-english",  # Sentiment
            "deepset/roberta-base-squad2"  # Q&A
        ]
        print(f"\n📦 Downloading {len(essential)} essential models...")
        download_models(essential)

    elif choice == "4":
        show_available_models()
        print("\nEnter model names (comma-separated):")
        custom_models = [m.strip() for m in input().split(',')]
        download_models(custom_models)

    elif choice == "5":
        cache_size = check_cache_size()
        cache_dir = os.path.expanduser("~/.cache/huggingface/hub")
        print(f"📁 Cache location: {cache_dir}")
        print(f"💾 Cache size: {cache_size:.2f} GB")

        if os.path.exists(cache_dir):
            cached = [item for item in os.listdir(cache_dir) if "models--" in item]
            print(f"🤖 Cached models: {len(cached)}")
            for model in cached[:10]:  # Show first 10
                print(f"   - {model}")
            if len(cached) > 10:
                print(f"   ... and {len(cached) - 10} more")

    else:
        print("Invalid choice!")

if __name__ == "__main__":
    main()