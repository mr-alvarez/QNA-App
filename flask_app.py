"""Flask web app for Azure Language Service Question Answering. Camilo Alvarez""" 

from dotenv import load_dotenv
import os
import logging
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from azure.core.credentials import AzureKeyCredential
from azure.ai.language.questionanswering import QuestionAnsweringClient

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask app with absolute path to static folder
static_dir = Path(__file__).parent / 'static'
app = Flask(__name__, static_folder=str(static_dir), static_url_path='')

# Enable CORS for all routes
CORS(app)

# Initialize QA client
def _get_qa_client():
    """Initialize and return the Question Answering client."""
    try:
        ai_endpoint = os.getenv('AI_SERVICE_ENDPOINT')
        ai_key = os.getenv('AI_SERVICE_KEY')
        
        if not ai_endpoint or not ai_key:
            logger.error("Missing AI_SERVICE_ENDPOINT or AI_SERVICE_KEY environment variables")
            return None
        
        credential = AzureKeyCredential(ai_key)
        client = QuestionAnsweringClient(endpoint=ai_endpoint, credential=credential)
        return client
    except Exception as e:
        logger.error(f"Failed to initialize QA client: {e}")
        return None


@app.post("/api/answer")
def answer_question():
    """Answer a question using Azure Language Service - Question Answering.
    
    Expected request body:
    {
        "question": "Your question here"
    }
    
    Returns:
    {
        "answer": "The answer from the knowledge base",
        "confidence": 0.85,
        "sources": ["source1.txt"]
    }
    """
    try:
        payload = request.get_json(silent=True)
        if not payload or "question" not in payload:
            return jsonify({"error": "Missing 'question' field in request body"}), 400
        
        question = payload.get("question", "").strip()
        if not question:
            return jsonify({"error": "Question cannot be empty"}), 400
        
        # Get QA client
        client = _get_qa_client()
        if not client:
            return jsonify({"error": "QA service not configured. Check AI_SERVICE_ENDPOINT and AI_SERVICE_KEY."}), 500
        
        # Get QA parameters from environment
        ai_project_name = os.getenv('QA_PROJECT_NAME')
        ai_deployment_name = os.getenv('QA_DEPLOYMENT_NAME')
        
        if not ai_project_name or not ai_deployment_name:
            return jsonify({"error": "QA project not configured. Check QA_PROJECT_NAME and QA_DEPLOYMENT_NAME."}), 500
        
        logger.info(f"Answering question: {question}")
        
        # Query the knowledge base
        output = client.get_answers(
            question=question,
            project_name=ai_project_name,
            deployment_name=ai_deployment_name
        )
        
        # Extract the best answer
        if output.answers and len(output.answers) > 0:
            top_answer = output.answers[0]
            
            response_data = {
                "answer": top_answer.answer,
                "confidence": float(top_answer.confidence) if hasattr(top_answer, 'confidence') else 0.0,
            }
            
            # Include sources if available
            if hasattr(top_answer, 'source') and top_answer.source:
                response_data["sources"] = [top_answer.source]
            
            logger.info(f"Answer found with confidence: {response_data['confidence']}")
            return jsonify(response_data), 200
        else:
            logger.info("No answers found for question")
            return jsonify({
                "answer": "I could not find an answer to your question in the knowledge base.",
                "confidence": 0.0,
                "sources": []
            }), 200
            
    except Exception as e:
        logger.error(f"Error answering question: {e}", exc_info=True)
        return jsonify({"error": f"An error occurred while processing your question: {str(e)}"}), 500


@app.get("/health")
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy"}), 200


@app.get("/")
def serve_index():
    """Serve the main index.html file."""
    return send_from_directory('static', 'index.html')


@app.get("/<path:filename>")
def serve_static(filename):
    """Serve static files (CSS, JS, images)."""
    return send_from_directory('static', filename)


def main():
    """Run the Flask development server."""
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1")
    
    logger.info(f"Starting Flask server on {host}:{port}")
    app.run(host=host, port=port, debug=debug)


if __name__ == "__main__":
    main()
