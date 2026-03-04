export const PaymentService = {
    initializePayment: async (orderData, userDetails, onSuccess, onFailure) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';

            script.onload = () => {
                if (!window.Razorpay) {
                    alert('Razorpay SDK failed to load.');
                    return resolve(false);
                }

                const options = {
                    key: 'rzp_test_YourKeyIdHere', // In prod, fetch from backend GET /api/v1/payment/config
                    name: 'Nestely POS',
                    description: 'Secure Order Checkout',
                    order_id: orderData.razorpayOrderId,
                    handler: function (response) {
                        // Payment success response from Razorpay UI
                        // Webhook handles actual verification on backend
                        onSuccess(response);
                    },
                    prefill: {
                        name: userDetails?.name || 'Customer',
                        email: userDetails?.email || 'customer@nestely.com'
                    },
                    theme: {
                        color: '#F97316'
                    }
                };

                const rzp = new window.Razorpay(options);

                rzp.on('payment.failed', function (response) {
                    onFailure(response.error);
                });

                rzp.open();
                resolve(true);
            };

            script.onerror = () => {
                alert('Failed to load Razorpay script.');
                resolve(false);
            };

            document.body.appendChild(script);
        });
    }
};
