export const createPaymentSession = async (amount, sessionId) => {
  try {
    const response = await fetch('http://localhost:3001/api/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100,
        sessionId: sessionId,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating payment session:', error);
    return null;
  }
};

export const verifyPaymentStatus = async (sessionId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/verify-payment/${sessionId}`);
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
};
