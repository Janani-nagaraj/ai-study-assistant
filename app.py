from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq

app = Flask(__name__)
CORS(app, origins=["*"])
import os
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    notes = data["notes"]
    prompt_type = data["type"]

    if prompt_type == "summary":
        prompt = f"Summarize these notes in simple bullet points:\n{notes}"
    elif prompt_type == "quiz":
        prompt = f"Generate 3 multiple choice questions with 4 options each. Also provide the correct answer.\nNotes:\n{notes}"
    elif prompt_type == "flashcards":
        prompt = f"Generate 4 flashcards in this format:\nQ: question\nA: answer\nNotes:\n{notes}"
    else:
        prompt = notes

    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": prompt}]
        )
        text = response.choices[0].message.content
        return jsonify({"result": text})
    except Exception as e:
        print("ERROR:", e)
        return jsonify({"result": f"Error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
