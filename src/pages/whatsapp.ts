export async function sendWhatsAppMessage(to: string) {
    const url = 'https://graph.facebook.com/v21.0/485647137970923/messages';

    const headers = {
      'Authorization': 'Bearer EAAPeuer7ybYBO21wlHSendKg6uKJNQsdcENLGIDzuZBFWbf0QpHzTgiKdZBWS7OZCoQLn9F77ctZBpOWfYH3Ok3BZCuEZChN0uycSbJWAzZAfUAWs5SZAZCe0N2wsgmhlYFPLcMEfcyYE3m1ZArGsN1dUniDPZCDzPnUZBRRyyXBDRRERrt0AqKbymZBYO9Kn1z1l0ZCktyWZAZBK3cK5tQmxUJn07ijQLb7a3UZD',
      'Content-Type': 'application/json'
    };
    
    const body = JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      type: 'template',
      template: {
        name: 'hello_world',
        language: {
          code: 'en_US'
        }
      }
    });
    
    fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log('Message sent successfully:', data);
    })
    .catch(error => {
      console.error('Error sending message:', error);
    });


}