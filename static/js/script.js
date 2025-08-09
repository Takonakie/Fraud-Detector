document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('prediction-form');
    const resultContainer = document.getElementById('result-container');
    const predictionResultElem = document.getElementById('prediction-result');
    const confidenceScoreElem = document.getElementById('confidence-score');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevents the form from submitting and refreshing the page

        // Get data from the form.
        const formData = {
            'transaction_amount': document.getElementById('transaction_amount').value,
            'customer_age': document.getElementById('customer_age').value,
            'transaction_duration': document.getElementById('transaction_duration').value,
            'login_attempts': document.getElementById('login_attempts').value,
            'account_balance': document.getElementById('account_balance').value,
            'transaction_type': document.getElementById('transaction_type').value,
            'channel': document.getElementById('channel').value,
            'occupation': document.getElementById('occupation').value
        };

        // Send data to the backend API
        fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                // Display error if one occurs
                predictionResultElem.textContent = `Error: ${data.error}`;
                confidenceScoreElem.textContent = '';
                // Add the fraud class for errors too
                predictionResultElem.className = 'status-fraud';
            } else {
                // Display the prediction result
                predictionResultElem.textContent = `Status: ${data.prediction_text}`;
                confidenceScoreElem.textContent = `Fraud Confidence Score: ${data.confidence_score}`;

                // --- THIS IS THE NEW LOGIC ---
                // We check the result text and apply the correct CSS class for color.
                if (data.prediction_text.includes('FRAUD')) {
                    predictionResultElem.className = 'status-fraud';
                } else {
                    predictionResultElem.className = 'status-normal';
                }
            }
            // Show the result container
            resultContainer.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error:', error);
            predictionResultElem.textContent = 'An error occurred while contacting the server.';
            confidenceScoreElem.textContent = '';
            predictionResultElem.className = 'status-fraud';
            resultContainer.classList.remove('hidden');
        });
    });
});
