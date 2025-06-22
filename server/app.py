from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import os
from werkzeug.utils import secure_filename
import whisper
from transformers import pipeline
from moviepy.editor import VideoFileClip

app = Flask(__name__)
CORS(app)

# Whisper for audio transcription
asr_model = whisper.load_model("tiny")  # or "base", "small"

# Hugging Face summarizer
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")

# Acceptable file extensions
ALLOWED_EXTENSIONS = {'txt', 'mp3', 'wav', 'm4a', 'mpga', 'mp4', 'mpeg', 'webm'}
app.config['MAX_CONTENT_LENGTH'] = 25 * 1024 * 1024  # 25MB max file size

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/summarize", methods=["POST"])
def summarize():
    try:
        transcript = ""

        # Case 1: File uploaded
        if 'file' in request.files:
            file = request.files['file']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                temp_dir = tempfile.gettempdir()
                file_path = os.path.join(temp_dir, filename)
                file.save(file_path)

                # For video files: extract audio
                if filename.endswith(('.mp4', '.mpeg', '.webm')):
                    audio_path = os.path.join(temp_dir, f"temp_audio_{filename}.wav")
                    video = VideoFileClip(file_path)
                    video.audio.write_audiofile(audio_path, logger=None)
                    transcript = transcribe_audio(audio_path)
                    os.remove(audio_path)
                    video.close()
                elif filename.endswith(('.mp3', '.wav', '.m4a', '.mpga')):
                    transcript = transcribe_audio(file_path)
                elif filename.endswith('.txt'):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        transcript = f.read()

                os.remove(file_path)

        # Case 2: JSON transcript text
        elif request.is_json and 'transcript' in request.json:
            transcript = request.json['transcript']

        if not transcript.strip():
            return jsonify({"error": "Transcript is empty or not provided."}), 400

        # Summarize
        summary_chunks = summarizer(transcript, max_length=120, min_length=30, do_sample=False)
        summary = "\n".join([chunk["summary_text"] for chunk in summary_chunks])
        return jsonify({"summary": summary})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def transcribe_audio(path):
    result = asr_model.transcribe(path, fp16=False)
    return result["text"]

if __name__ == "__main__":
    app.run(debug=True)
