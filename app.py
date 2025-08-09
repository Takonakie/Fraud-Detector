import numpy as np
from flask import Flask, request, jsonify, render_template
import joblib

app = Flask(__name__)

try:

    model = joblib.load("random_forest_tuned_model.pkl")
    print("Model loaded successfully! Ready to make predictions.")
except Exception as e:
    print(f"Heads-up: The model failed to load. Error: {e}")
    model = None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'The model is not available. Please check server logs.'}), 500

    try:
        data = request.get_json(force=True)
        print(f"Received data for prediction: {data}")

        transaction_amount = float(data['transaction_amount'])
        customer_age = int(data['customer_age'])
        transaction_duration = int(data['transaction_duration'])
        login_attempts = int(data['login_attempts'])
        account_balance = float(data['account_balance'])
        type_debit = data['transaction_type'] == 'debit'
        
        channel_branch = data['channel'] == 'branch'
        channel_online = data['channel'] == 'online'
        
        occupation = data['occupation']
        occ_engineer = occupation == 'engineer'
        occ_retired = occupation == 'retired'
        occ_student = occupation == 'student'
        
        features = [
            transaction_amount, customer_age, transaction_duration,
            login_attempts, account_balance, type_debit, channel_branch,
            channel_online, occ_engineer, occ_retired, occ_student
        ]

        final_features = [np.array(features)]
        
        prediction_result = model.predict(final_features)
        prediction_probability = model.predict_proba(final_features)

        status = "Detected as FRAUD" if prediction_result[0] == 1 else "Normal Transaction"
        
        confidence = f"{prediction_probability[0][1] * 100:.2f}%"

        return jsonify({
            'prediction_text': status,
            'confidence_score': confidence
        })

    except Exception as e:
        print(f"An error occurred during prediction: {e}")
        return jsonify({'error': f'An error occurred: {e}'}), 400

if __name__ == "__main__":
    app.run(debug=True)