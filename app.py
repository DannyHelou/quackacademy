from flask import Flask, request, jsonify
from transformers import pipeline
from flask_cors import CORS
import openai
import whisper
import os
import spacy
import profile_building

app = Flask(__name__)
CORS(app)

# Dummy user data for login (in real applications, store this in a database)
users = {
    "user@example.com": {
        "password": "password123"
    },
    "user@gmail.com": {
        "password": "password123"
    }
}

# ---- For Sentiment Analysis ----
emotion_model = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base")

@app.route('/journal', methods=['POST'])
def analyze_journal():
    data = request.get_json()  # Receive JSON data from the front-end
    journal_text = data.get('journal', '')  # Extract the journal entry

    if not journal_text:  # Check if the text is empty
        return jsonify({"error": "Journal text cannot be empty"}), 400

    # Analyze the sentiment of the journal text
    sentiment = emotion_model(journal_text)
    print(f"Sentiment analysis result: {sentiment}")
    
    return jsonify(sentiment)  # Return the sentiment result as JSON

# ---- ChatGPT Route for Chatbot ----

preprompt = ("""
             
You are the best teacher in the world, known for your kind and patient approach, especially when helping kids with self-learning. Today, you are going to help a student learn in a structured and guided way. Follow these specific steps:


1. Greet the student warmly and ask, "What would you like to study today?" (Make sure to ask for an overall subject, like "linear algebra" or "biology.")

2. Once they provide the subject, ask, "At what level would you like to study this?" (Encourage them to specify their experience elementary, middle, highschool, college level, whatever's applicable)

3. After receiving their level, generate a list of major topics that fall under the subject they've chosen. For example, if it's "linear algebra," list topics like "vectors," "matrices," "linear transformations," etc. Ask, "Which of these topics would you like to focus on today?"

4. After the student picks a smaller topic, generate a detailed sub-topic list within that specific area. For each sub-topic, ask the student to explain everything they know about it. Don’t provide feedback or interrupt—just gently encourage them to continue until they have covered all the sub-topics, DO NOT FOLLOW UP ON THEIR EXPLANATIONS, MOVE TO THE NEXT SUBTOPIC WHEN THEY ARE DONE EXPLAINING, YOU ARE PERMITTED TO PROVIDE THEM WITH 1 THEORY QUESTION AFTER THEIR EXPLANATION.
    a. Listen and Identify Gaps
    - If the user is explaining a concept to you, listen carefully to their explanation. 
    - When you notice any gaps after they've complete they explanation ofcourse, misconceptions, or missing understanding, highlight these gently and provide clarification in a supportive way, without making the user feel bad.

For instance, say:

"Great, let's start with [Sub-topic 1]. Could you explain what you know about this?"
Then move on to the next: "Now let's move on to [Sub-topic 2]. What do you know about this?"
Continue this process for all the sub-topics.

5. Once the student has finished explaining all the sub-topics, ask: "Would you like to go over anything else before I provide some feedback on your understanding?" If the student says yes, oblige and go over any additional topics or questions they have.
             
6. Once fully dont, make a list of all the subjects that the student perfomed well or bad on and tell them what to do in order to further prepare.
""" )


conversation_history = [{"role": "system", "content": preprompt}]

openai.api_key = "hidden"

@app.route('/chat', methods=['POST'])
def chat_with_gpt():
    data = request.get_json()  # Get JSON data from the front-end
    user_message = data.get('message', '')
    
    
    if not user_message:  # Check if the message is empty
        return jsonify({"error": "Message cannot be empty"}), 400

    try:
        # Send the user's message to the OpenAI API

        conversation_history.append({"role": "user", "content": user_message})
        
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages = conversation_history
        )

        #wrap up for gpt segment

        chatgpt_response = response.choices[0].message.content



        conversation_history.append({"role": "assistant", "content": chatgpt_response})
        
        #Updating user data

        sentences = profile_building.split_into_sentences(user_message)

        profile_building.create_labels(sentences, conversation_history[-2]["content"])

        
        # Return the response back to the front-end
        return chatgpt_response

    except Exception as e:
        print(f"Error during ChatGPT interaction: {e}")
        return jsonify({"error": str(e)}), 500
    
#LOGIN PAGE
    
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Check if the email exists in users and the password matches
    if email in users and users[email]['password'] == password:
        return jsonify({"success": True, "message": "Login successful!"})
    else:
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

#Speech to text
model = whisper.load_model("base")

# Set up directory to save uploaded audio files
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    # Check if audio file is in request
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    file_path = os.path.join(UPLOAD_FOLDER, audio_file.filename)
    audio_file.save(file_path)
    # Transcribe the audio using Whisper
    result = model.transcribe(file_path)
    os.remove(file_path)  # Optional: Clean up the saved audio file

    # Return the transcribed text
    return jsonify({"text": result['text']})

if __name__ == '__main__':
    app.run(debug=True)