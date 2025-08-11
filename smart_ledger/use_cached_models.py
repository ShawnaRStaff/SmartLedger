#!/usr/bin/env python3
"""
Use Cached Models Script
Test and use your downloaded Hugging Face models offline
"""

import os
import warnings
from transformers import pipeline

# Clean up output
os.environ["TOKENIZERS_PARALLELISM"] = "false"
warnings.filterwarnings("ignore", category=UserWarning)

def test_offline_mode():
    """Test if we can work offline"""
    print("🔌 OFFLINE MODE TEST")
    print("=" * 50)

    # Force offline mode
    os.environ["TRANSFORMERS_OFFLINE"] = "1"

    print("✅ Offline mode activated")
    print("📡 Internet connection disabled for Hugging Face")
    print()

def show_cached_models():
    """Show what models are cached"""
    cache_dir = os.path.expanduser("~/.cache/huggingface/hub")

    if not os.path.exists(cache_dir):
        print("❌ No cache directory found. Run setup_models.py first!")
        return []

    cached = [item for item in os.listdir(cache_dir) if "models--" in item]

    print("📦 CACHED MODELS")
    print("=" * 50)
    print(f"📁 Location: {cache_dir}")
    print(f"🤖 Found {len(cached)} cached models:")

    for i, model in enumerate(cached, 1):
        # Clean up the model name for display
        clean_name = model.replace("models--", "").replace("--", "/")
        print(f"   {i:2d}. {clean_name}")

    print()
    return cached

def demo_text_generation():
    """Demo text generation with GPT-2"""
    print("🤖 TEXT GENERATION DEMO")
    print("-" * 30)

    try:
        generator = pipeline("text-generation", model="gpt2")

        prompts = [
            "The future of artificial intelligence is",
            "In a world where robots and humans coexist",
            "The most important skill in 2025 will be"
        ]

        for prompt in prompts:
            print(f"💭 Prompt: '{prompt}'")
            result = generator(prompt, max_length=50, num_return_sequences=1,
                             temperature=0.7, do_sample=True)
            generated = result[0]['generated_text']
            print(f"✨ Generated: {generated}")
            print()

    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Make sure GPT-2 is downloaded (run setup_models.py)")

    print("-" * 50)

def demo_sentiment_analysis():
    """Demo sentiment analysis"""
    print("😊 SENTIMENT ANALYSIS DEMO")
    print("-" * 30)

    try:
        classifier = pipeline("sentiment-analysis")

        texts = [
            "I absolutely love this product!",
            "This is the worst thing ever.",
            "It's okay, nothing special.",
            "Amazing quality and fast delivery!",
            "Terrible customer service experience."
        ]

        for text in texts:
            result = classifier(text)
            sentiment = result[0]
            print(f"📝 Text: '{text}'")
            print(f"🎯 Sentiment: {sentiment['label']} ({sentiment['score']:.3f})")
            print()

    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Make sure sentiment model is downloaded")

    print("-" * 50)

def demo_question_answering():
    """Demo question answering"""
    print("❓ QUESTION ANSWERING DEMO")
    print("-" * 30)

    try:
        qa = pipeline("question-answering", model="deepset/roberta-base-squad2")

        context = """
        Hugging Face is an American company based in New York City that develops
        tools for building applications using machine learning. It is most notable
        for its transformers library built for natural language processing applications
        and its platform that allows users to share machine learning models and datasets.
        The company was founded in 2016 by Clément Delangue and Julien Chaumond.
        """

        questions = [
            "What does Hugging Face develop?",
            "Where is Hugging Face based?",
            "When was Hugging Face founded?",
            "Who founded Hugging Face?"
        ]

        print("📄 Context: Hugging Face company info...")
        print()

        for question in questions:
            result = qa(question=question, context=context)
            print(f"❓ Q: {question}")
            print(f"✅ A: {result['answer']} (confidence: {result['score']:.3f})")
            print()

    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Make sure Q&A model is downloaded")

    print("-" * 50)

def demo_summarization():
    """Demo text summarization"""
    print("📋 SUMMARIZATION DEMO")
    print("-" * 30)

    try:
        summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

        long_text = """
        Artificial intelligence (AI) is intelligence demonstrated by machines,
        in contrast to the natural intelligence displayed by humans and animals.
        Leading AI textbooks define the field as the study of "intelligent agents":
        any device that perceives its environment and takes actions that maximize
        its chance of successfully achieving its goals. Colloquially, the term
        "artificial intelligence" is often used to describe machines (or computers)
        that mimic "cognitive" functions that humans associate with the human mind,
        such as "learning" and "problem solving". As machines become increasingly
        capable, tasks considered to require "intelligence" are often removed from
        the definition of AI, a phenomenon known as the AI effect. A quip in Tesler's
        Theorem says "AI is whatever hasn't been done yet." For instance, optical
        character recognition is frequently excluded from things considered to be AI,
        having become a routine technology.
        """

        print("📄 Original text: AI definition (long)")
        print()

        summary = summarizer(long_text, max_length=50, min_length=25, do_sample=False)
        print("📝 Summary:")
        print(summary[0]['summary_text'])
        print()

    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Make sure BART summarization model is downloaded")

    print("-" * 50)

def interactive_mode():
    """Interactive mode to test models"""
    print("🎮 INTERACTIVE MODE")
    print("=" * 50)

    while True:
        print("\nChoose a task:")
        print("1. Generate text")
        print("2. Analyze sentiment")
        print("3. Ask a question")
        print("4. Summarize text")
        print("5. Quit")

        choice = input("\nEnter choice (1-5): ").strip()

        if choice == "1":
            prompt = input("Enter text prompt: ")
            try:
                generator = pipeline("text-generation", model="gpt2")
                result = generator(prompt, max_length=80, num_return_sequences=1)
                print(f"\n✨ Generated: {result[0]['generated_text']}")
            except Exception as e:
                print(f"❌ Error: {e}")

        elif choice == "2":
            text = input("Enter text to analyze: ")
            try:
                classifier = pipeline("sentiment-analysis")
                result = classifier(text)
                sentiment = result[0]
                print(f"\n😊 Sentiment: {sentiment['label']} ({sentiment['score']:.3f})")
            except Exception as e:
                print(f"❌ Error: {e}")

        elif choice == "3":
            context = input("Enter context: ")
            question = input("Enter question: ")
            try:
                qa = pipeline("question-answering", model="deepset/roberta-base-squad2")
                result = qa(question=question, context=context)
                print(f"\n✅ Answer: {result['answer']} (confidence: {result['score']:.3f})")
            except Exception as e:
                print(f"❌ Error: {e}")

        elif choice == "4":
            text = input("Enter text to summarize: ")
            try:
                summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
                summary = summarizer(text, max_length=50, min_length=10)
                print(f"\n📝 Summary: {summary[0]['summary_text']}")
            except Exception as e:
                print(f"❌ Error: {e}")

        elif choice == "5":
            print("👋 Goodbye!")
            break

        else:
            print("Invalid choice!")

def main():
    print("🤖 CACHED MODELS TESTER")
    print("=" * 50)

    # Show cached models
    cached = show_cached_models()

    if not cached:
        print("🔧 No models found. Run 'python setup_models.py' first!")
        return

    # Test offline mode
    test_offline_mode()

    print("What would you like to do?")
    print("1. Run all demos")
    print("2. Interactive mode")
    print("3. Just test one model")

    choice = input("\nEnter choice (1-3): ").strip()

    if choice == "1":
        print("\n🎬 RUNNING ALL DEMOS")
        print("=" * 50)
        demo_text_generation()
        demo_sentiment_analysis()
        demo_question_answering()
        demo_summarization()
        print("🎉 All demos complete!")

    elif choice == "2":
        interactive_mode()

    elif choice == "3":
        print("\nWhich model to test?")
        print("1. Text Generation (GPT-2)")
        print("2. Sentiment Analysis")
        print("3. Question Answering")
        print("4. Summarization")

        test_choice = input("Enter choice (1-4): ").strip()

        if test_choice == "1":
            demo_text_generation()
        elif test_choice == "2":
            demo_sentiment_analysis()
        elif test_choice == "3":
            demo_question_answering()
        elif test_choice == "4":
            demo_summarization()
        else:
            print("Invalid choice!")

    else:
        print("Invalid choice!")

if __name__ == "__main__":
    main()